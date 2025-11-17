import { Request, Response } from "express";
import Patient from "../models/patient.model";

// ---- Crear un nuevo paciente ----
export const createPatient = async (req: Request, res: Response) => {
    const { nombreCompleto, CI, fechaNacimiento, telefono } = req.body;

    try {
        //validar si el paciente ya existe por CI
        const patientExist = await Patient.findOne({ CI });
        if (patientExist) {
            return res.status(400).json({ message: 'El paciente con este CI ya existe' });
        }

        const patient = await Patient.create({
            nombreCompleto,
            CI,
            fechaNacimiento,
            telefono,
        });

        res.status(201).json({ message: 'Paciente creado exitosamente', patient });

    } catch (error) {

        if (error instanceof Error) {
            res.status(500).json({ message: 'Error en el servidor al crear paciente', error: error.message });
        }else{
            res.status(500).json({ message: 'Error del servidor desconocido' });
        }
        
    }
}

// ---- Obtener todos los pacientes ----
export const getAllPatients = async (req: Request, res: Response) => {
    try {
        const patients = await Patient.find({});
        res.json({ patients });    
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor al obtener pacientes' });
    }
};