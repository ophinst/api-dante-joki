import { createClient } from "@supabase/supabase-js";
import { Env } from "./env-loader";

const supabase = createClient(`${Env.SUPABASE_URL}`, `${Env.SUPABASE_KEY}`);

export default async function uploadFile(file: Express.Multer.File, transactionId: string) {
    try {
        const bucketName = Env.SUPABASE_BUCKET as string;
        const filePath = `transaction/${transactionId}_${Date.now()}_${file.originalname}`;
        
        const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file.buffer);
		console.log(data);

        if (error) {
            console.error("Upload error:", error);
            return null;
        }

        const urlData = supabase.storage.from(bucketName).getPublicUrl(filePath);

        return urlData.data.publicUrl.toString();
    } catch (error) {
        console.error("Error in uploadFileToSupabase:", error);
        return null;
    }
}
