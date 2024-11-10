import fs from "fs"
import path from "path"

import supabase, { supabaseUrl } from "./supabase.js"
import Cat from "./models/Cats.js"
import connectDB from "./db/connect.js"

import dotenv from "dotenv"
dotenv.config()

const imagesFolder = "./cats"
const bucketId = process.env.BUCKET_NAME || ""

let currentOuput = 10
let currentPrice = 500
let currentQuaterlyValue = 0.09

async function uploadCats() {
	const dir = fs.readdirSync(imagesFolder)
	dir.sort((a, b) => {
		if (Number(a.split(".")[0]) > Number(b.split(".")[0])) return 1
		return -1
	})
	connectDB(process.env.MONGO_URI || "")
	await supabase.storage.emptyBucket(bucketId)
	await Cat.deleteMany({})

	dir.forEach(async (file) => {
		const fileName = file

		const level = Number(fileName.split(".")[0])
		// console.log({ fileName, level })
		const outPutInterval = level >= 6 ? 20 : 10

		const priceInterval =
			level >= 6 ? 2400 : level == 1 ? 700 : level == 3 ? 2400 : 1200

		const quarterlyInterval = 0.08

		const potion =
			level < 9
				? "ordinary potion"
				: level >= 9 && level < 17
				? "excellent potion"
				: level >= 17 && level < 25
				? "epic potion"
				: level >= 25 && level < 33
				? "legendary potion"
				: level >= 33 && level < 41
				? "Mythic potion"
				: "Ultimate potion"

		const maxPurchase =
			level < 9
				? 2
				: level >= 9 && level < 17
				? 3
				: level >= 17 && level < 25
				? 4
				: level >= 25 && level < 33
				? 5
				: level >= 33 && level < 41
				? 6
				: 7

		const feeDividend =
			level == 8
				? 4.76
				: level == 16
				? 9.52
				: level == 24
				? 14.29
				: level == 32
				? 19.05
				: level == 40
				? 23.81
				: level == 48
				? 28.57
				: 0

		const imageSupabasePath = `${Math.random()}-${fileName}`

		const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketId}/${imageSupabasePath}`

		const imagePath = path.join(imagesFolder, fileName)

		const fileContent = fs.readFileSync(imagePath)
		const extname = path.extname(fileName).toLowerCase()
		try {
			const createdCat = {
				name: fileName,
				imageUrl,
				outputQuantity:
					level == 1 ? currentOuput : currentOuput + outPutInterval,
				price: level == 1 ? currentPrice : currentPrice + priceInterval,

				quaterlyAirdopValue:
					level == 1
						? currentQuaterlyValue
						: currentQuaterlyValue + quarterlyInterval,

				potion,

				feeDividend,
				maxPurchase,

				level,
			}

			console.log(createdCat)
			currentOuput = createdCat.outputQuantity
			currentPrice = createdCat.price
			currentQuaterlyValue = createdCat.quaterlyAirdopValue

			await uploadImages(imageSupabasePath, fileContent, extname)

			await Cat.create(createdCat)
		} catch (error) {
			console.log(error)
		}
	})
	console.log("done")
}

async function uploadImages(
	imageName: string,
	fileBuffer: Buffer,
	extname: string
) {
	const { error } = await supabase.storage
		.from(bucketId)
		.upload(imageName, fileBuffer, {
			contentType: `image/${extname.replace(".", "")}`,
		})

	if (error) throw new Error(error.message)
}

uploadCats()
