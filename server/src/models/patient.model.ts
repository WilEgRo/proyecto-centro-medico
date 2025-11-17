import { Schema, Document, model, Model } from "mongoose";

// interfaz para el documento de paciente
export interface IPatient extends Document {
    nombreCompleto: string;
    CI: string; // Carnet de identidad
    fechaNacimiento: Date;
    telefono: string;
}

// esquema de MONGOOSE
const patientSchema: Schema<IPatient> = new Schema({
    nombreCompleto: {
        type: String,
        required: true,
        trim: true,
    },
    CI: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    fechaNacimiento: {
        type: Date,
        required: true,
    },
    telefono: {
        type: String,
        required: true,
        trim: true,
    }
})

const Patient: Model<IPatient> = model<IPatient>("Patient", patientSchema);

export default Patient;