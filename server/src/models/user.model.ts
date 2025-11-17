import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

//Interfaz para la contraseña (para los metodos)
export interface IUserPassword extends Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// interfaz para el documento de usuario (conbina mongoose Document y IUserPassword)
export interface IUser extends IUserPassword{
    username: string;
    password: string;
    role: 'ADMIN' | 'RECEPCIONISTA' | 'MEDICO';
}

// esquema de MONGOOSE
const userSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['ADMIN', 'RECEPCIONISTA', 'MEDICO'],
        default: 'MEDICO',
    }
},{
    timestamps: true,
})

// --- hook pre-save para hashear la contraseña ---
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password =  await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
}

// --- método para comparar contraseñas ---
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;