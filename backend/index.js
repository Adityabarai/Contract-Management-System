const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Jwt = require("jsonwebtoken");

require("./db/config");
const User = require("./db/User");
const Employee = require("./db/employee");

const app = express();
const jwtKey = "CMS";

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, `${uniqueSuffix}-${file.originalname}`);
	},
});
const upload = multer({ storage });

// JWT Verification Middleware
function verifyToken(req, res, next) {
	let token = req.headers["authorization"];
	if (token) {
		token = token.split(" ")[1];
		Jwt.verify(token, jwtKey, (err, valid) => {
			if (err) {
				return res.status(401).send({ result: "Please provide a valid token" });
			}
			next();
		});
	} else {
		res.status(403).send({ result: "Please add token to the header" });
	}
}

// User Registration
app.post("/register", async (req, res) => {
	try {
		const user = new User(req.body);
		let result = await user.save();
		result = result.toObject();
		delete result.password;

		Jwt.sign({ user }, jwtKey, { expiresIn: "4h" }, (err, token) => {
			if (err) {
				return res.send({ result: "Something went wrong, try again later" });
			}
			res.send({ user, auth: token });
		});
	} catch (error) {
		console.error("Error during registration:", error);
		res.status(500).send({ error: "Failed to register user" });
	}
});

// User Login
app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	if (email && password) {
		const user = await User.findOne({ email, password }).select("-password");
		if (user) {
			Jwt.sign({ user }, jwtKey, { expiresIn: "4h" }, (err, token) => {
				if (err) {
					return res.send({ result: "Something went wrong, try again later" });
				}
				res.send({ user, auth: token });
			});
		} else {
			res.send({ result: "No User Found" });
		}
	} else {
		res.send({ result: "Invalid input" });
	}
});

// Add Employee
app.post("/add-emp", upload.single("image"), async (req, res) => {
	try {
		const filePath = req.file ? `uploads/${req.file.filename}` : null; // Handle image file path

		const employeeData = {
			unique: req.body.unique,
			contractorName: req.body.contractorName,
			company: req.body.company,
			email: req.body.email,
			number: req.body.number,
			category: req.body.category,
			starting: req.body.starting,
			ending: req.body.ending,
			cost: req.body.cost,
			image: filePath,
		};

		const newEmployee = new Employee(employeeData);
		const result = await newEmployee.save();

		res.json({ message: "Employee added successfully", employee: result });
	} catch (error) {
		console.error("Error adding employee:", error);
		res.status(500).json({ error: "Failed to add employee" });
	}
});

// Get Employee List
app.get("/employee", verifyToken, async (req, res) => {
	const employees = await Employee.find();
	if (employees.length > 0) {
		res.send(employees);
	} else {
		res.send({ result: "No Employee Found" });
	}
});
 
// Get Employee Details by ID
app.get("/employee/:id", async (req, res) => {
	const result = await Employee.findById(req.params.id);
	if (result) {
		res.send(result);
	} else {
		res.send({ result: "No result found" });
	}  
});   

// Delete Employee
app.delete("/employee/:id", verifyToken, async (req, res) => {
	const result = await Employee.deleteOne({ _id: req.params.id });
	res.send(result);
});

// Update Employee
app.put(
	"/emp-update/:id",
	verifyToken,
	upload.single("image"),
	async (req, res) => {
		try {
			const updatedData = {
				name: req.body.name,
				email: req.body.email,
				salary: req.body.salary,
				address: req.body.address,
				category: req.body.category,
			};

			if (req.file) {
				updatedData.image = `uploads/${req.file.filename}`;
			}

			const result = await Employee.updateOne(
				{ _id: req.params.id },
				{ $set: updatedData }
			);
			res.send(result);
		} catch (error) {
			console.error("Error updating employee:", error);
			res.status(500).json({ error: "Failed to update employee" });
		}
	}
);

// Search Employees
// Search Employees
app.get("/search/:key", verifyToken, async (req, res) => {
	const key = req.params.key;

	// Check if the key is a number
	const isNumeric = !isNaN(key);
	const searchConditions = [
		{ unique: { $regex: key, $options: "i" } },
		{ contractorName: { $regex: key, $options: "i" } },
		{ company: { $regex: key, $options: "i" } },
		{ email: { $regex: key, $options: "i" } },
		{ number: { $regex: key, $options: "i" } },
		{ category: { $regex: key, $options: "i" } },
		{ starting: { $regex: key } },
		{ ending: { $regex: key } },
	];

	// If it's a numeric search, add the cost to the query
	if (isNumeric) {
		const cost = parseFloat(key);
		searchConditions.push({ cost });
	}

	try {
		const result = await Employee.find({
			$or: searchConditions,
		});
		res.send(result);
	} catch (error) {
		console.error("Error during search:", error);
		res.status(500).send({ error: "Search failed" });
	}
});


// Start Server
app.listen(5000, () => {
	console.log("Server is running on port 5000");
});
