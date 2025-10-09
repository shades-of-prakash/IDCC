import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		points: {
			type: Number,
			required: true,
			min: 0,
			default: 10,
		},
		arguments: {
			type: Array,
			required: true,
		},
		codes: {
			type: Object,
			required: true,
		},
		functionName: {
			type: String,
			required: true,
		},
		hiddenTests: {
			type: Array,
			default: [],
		},
		visibleTests: {
			type: Array,
			default: [],
		},
		returnType: {
			type: String,
			required: true,
		},
		statement: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

const ContestSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		conductedBy: {
			type: String,
			default: "IDCC",
		},
		numberOfProblems: {
			type: Number,
			required: true,
		},
		durationMinutes: {
			type: Number,
			required: true,
		},
		teamSize: {
			type: String,
			enum: ["Individual", "Team"],
			required: true,
		},
		bannerImage: {
			type: String,
		},
		questions: {
			type: [QuestionSchema],
			default: [],
		},
	},
	{ timestamps: true }
);

const Contest = mongoose.model("Contest", ContestSchema);
export default Contest;
