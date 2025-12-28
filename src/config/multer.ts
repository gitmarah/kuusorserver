import multer from "multer";
const multerUpload = multer({ storage: multer.memoryStorage(), });

export default multerUpload;