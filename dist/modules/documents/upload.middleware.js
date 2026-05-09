"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const errors_1 = require("../../utils/errors");
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.resolve(__dirname, '../../../uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${(0, uuid_1.v4)()}${ext}`);
    },
});
function fileFilter(req, file, cb) {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errors_1.AppError('Invalid file type. Allowed: JPEG, PNG, PDF', 400));
    }
}
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE },
});
//# sourceMappingURL=upload.middleware.js.map