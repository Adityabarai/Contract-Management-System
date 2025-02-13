const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
	id: { type: String, required: true }, // Define the unique field
	contractorName: { type: String, required: true }, // Define the contractorName field
	vendor: { type: String, required: true },
	email: { type: String, required: true },
	number: { type: String, required: true },
	category: { type: String, required: true },
	starting: { type: String, required: true },
	ending: { type: String, required: true },
	expenditure: { type: Number, required: true },
	status: { type: String, required: true },
	image: { type: String },
});
  
module.exports = mongoose.model("employees", employeeSchema);
