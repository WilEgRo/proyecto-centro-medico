import { Schema, model, Document, Model, Types } from 'mongoose';

//estado del turno
type AppointmentStatus = 'PROGRAMADO' | 'ATENDIDO' | 'CANCELADO' | 'AUSENTE';

// interfaz para el documento de turno
export interface IAppointment extends Document {
    paciente: Types.ObjectId; // referencia a IPatient
    medico: Types.ObjectId; // referencia a IUser con rol 'MEDICO'
    fecha: Date;
    hora: string;
    motivo: string;
    estado: AppointmentStatus;
}

// esquema de MONGOOSE
const appointmentSchema: Schema<IAppointment> = new Schema({
  paciente: {
    type: Schema.Types.ObjectId,
    ref: 'Patient', // Referencia al modelo 'Patient'
    required: true,
  },
  medico: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Referencia al modelo 'User'
    required: true,
  },
  fecha: {
    type: Date,
    required: true,
  },
  hora: {
    type: String,
    required: true,
  },
  motivo: {
    type: String,
    required: true,
  },
  estado: {
    type: String,
    required: true,
    enum: ['PROGRAMADO', 'ATENDIDO', 'CANCELADO', 'AUSENTE'],
    default: 'PROGRAMADO',
  },
}, { timestamps: true });

// modelo
const Appointment: Model<IAppointment> = model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;