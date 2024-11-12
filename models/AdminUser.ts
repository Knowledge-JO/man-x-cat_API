import { model, Schema } from "mongoose"
import bycrypt from "bcryptjs"

interface IAdmin {
	name: string
	telegramId: number
	username: string
	password: string
}

const adminSchema: Schema = new Schema(
	{
		name: {
			type: String,
			required: false,
			minLength: 3,
			maxLength: 30,
			default: "Admin user",
		},
		telegramId: { type: Number, required: [true, "telegram id is required"] },
		username: { type: String, required: [true, "specify a username"] },
		password: {
			type: String,
			minLength: 8,
			required: [true, "specify a password"],
		},
	},
	{ timestamps: true }
)

adminSchema.pre("save", async function (next) {
	const salt = await bycrypt.genSalt(10)
	this.password = await bycrypt.hash(String(this.password), salt)
	next()
})

const Admin = model<IAdmin>("Admin", adminSchema)

export default Admin
