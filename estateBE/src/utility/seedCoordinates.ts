import mongoose from "mongoose";
import dotenv from "dotenv";
import Property from "../models/Property";
import path from "path";
import { getCoordinatesFromCity } from "./geocode";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const seedCoordinates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL as string);
    console.log("Connected to MongoDB for re-seeding...");

    const properties = await Property.find({});
    console.log(`Found ${properties.length} properties to update.`);

    let count = 0;
    for (const property of properties) {
      // Use the actual city or location from the database
      const searchQuery = property.city || property.location || "Mumbai";
      const coords = await getCoordinatesFromCity(searchQuery);

      if (coords) {
        // Adding a tiny random offset so properties in the exact same city don't stack directly on top of each other
        const latOffset = (Math.random() - 0.5) * 0.01;
        const lngOffset = (Math.random() - 0.5) * 0.01;

        await Property.updateOne(
          { _id: property._id },
          { 
            $set: { 
              coordinates: {
                lat: coords.lat + latOffset,
                lng: coords.lng + lngOffset,
              }
            }
          }
        );
        console.log(`✅ Updated ${property.title} -> ${searchQuery} (${coords.lat}, ${coords.lng})`);
        count++;
      } else {
        console.log(`❌ Failed to find coordinates for ${searchQuery}`);
      }

      // Small delay to prevent hitting the free API too fast
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Successfully updated ${count} properties with real coordinates.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding coordinates:", error);
    process.exit(1);
  }
};

seedCoordinates();
