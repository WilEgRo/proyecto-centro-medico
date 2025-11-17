import { useState, useEffect, type CSSProperties} from "react";
import api from "../services/api";

// Defición de tipos
interface Patient {
    _id: string;
    nombreCompleto: string;
    CI: string;
}

interface Medico{
    _id: string;
    username: string; // El nombre del medico es su username
}

interface Appointment {
    _id: string;
    paciente: {
        _id: string;
        nombreCompleto: string;
    };
    medico: {
        _id: string;
        username: string;
    };
    fecha: string; // mantenemos como string para simplicidad
    hora: string;
    motivo: string;
    estado: string;
}

//----- Componente -----
const PanelRecepcionista = () => {
    // --- Estados ---
    const [patients, setPatients] = useState<Patient[]>([]);
    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // estados para los formularios
    const [patientForm, setPatientForm] = useState({
        nombreCompleto: '',
        CI: '',
        fechaNacimiento: '',
        telefono: '',
    });

    const [appointmentForm, setAppointmentForm] = useState({
        paciente: '', // ID del paciente
        medico: '', // ID del médico
        fecha: '',
        hora: '',
        motivo: '',
    });

    // --- Efecto para cargar todos los datos ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/patients');

            // Tu log muestra que el array está dentro de la propiedad 'patients'
            if (res.data && Array.isArray(res.data.patients)) {
                setPatients(res.data.patients);
            } 
            // O tal vez es un array directo (por si acaso)
            else if (Array.isArray(res.data)) {
                setPatients(res.data);
            } 
            else {
                console.warn("Formato de pacientes desconocido:", res.data);
                setPatients([]);
            }
        } catch (error) {
            console.error("Error cargando pacientes:", error);
        }
        try {
            // hacemos las 3 peticiones en paralelo
            const [/*patientsRes,*/ medicosRes, appointmentsRes] = await Promise.all([
               /* api.get<Patient[]>('/patients'),*/
                api.get<Medico[]>('/users/medicos'),
                api.get<Appointment[]>('/appointments?estado=PROGRAMADO'),
            ]);

            //setPatients(patientsRes.data);
            setMedicos(medicosRes.data);
            setAppointments(appointmentsRes.data);
            setError(null);
        } catch (error) {
            setError('Error al cargar datos. Verifique el servidor.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // ------ manejadores de formularios ------
    const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPatientForm({ ...patientForm, [e.target.name]: e.target.value }); // soporta solo input
    }

    const handleAppointmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setAppointmentForm({ ...appointmentForm, [e.target.name]: e.target.value }); // soporta input y select
    }

    // ------ Manejador: Crear Paciente ------
    const handleCreatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        try {
            const response = await api.post<Patient>('/patients', patientForm);
            setPatients(prevPatients => {
                if (Array.isArray(prevPatients)) {
                    return [...prevPatients, response.data];
                } else {
                    // Si estaba corrupto, reiniciamos la lista con el nuevo paciente
                    return [response.data];
                }
            });
            setPatientForm({ nombreCompleto: '', CI: '', fechaNacimiento: '', telefono: '' }); // Limpiar form
            setMessage('Paciente creado con éxito');
            fetchData(); // Actualizar datos
        } catch (err: any) {
            console.error("Error creando paciente:", err);
            setError(err.response?.data?.message || 'Error al crear paciente');
        }
    };
    // --- Manejador: Crear Turno ---
    const handleCreateAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        try {
            await api.post<Appointment>('/appointments', appointmentForm);
            
            // Para actualizar la lista de turnos, volvemos a llamar a fetchData
            // Es más simple que construir el objeto 'Appointment' a mano
            fetchData(); 
            
            setAppointmentForm({ paciente: '', medico: '', fecha: '', hora: '', motivo: '' }); // Limpiar form
            setMessage('Turno creado con éxito');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear turno');
        }
    };

    // --- Renderizado ---
    if (loading) return <div>Cargando datos del panel...</div>;

    return (
        <div style={styles.container}>
        {/* Mensajes Globales */}
        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.message}>{message}</p>}

        {/* --- Sección 1: Gestión (Formularios) --- */}
        <div style={styles.managementSection}>
             {/* Formulario de Pacientes */}
            <div style={styles.formContainer}>
                <h3 style={styles.heading}>Registrar Nuevo Paciente</h3>
                <form onSubmit={handleCreatePatient}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Nombre Completo</label>
                    <input type="text" name="nombreCompleto" value={patientForm.nombreCompleto} onChange={handlePatientChange} style={styles.input} required />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Cédula (CI)</label>
                    <input type="text" name="CI" value={patientForm.CI} onChange={handlePatientChange} style={styles.input} required />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Fecha Nacimiento</label>
                    <input type="date" name="fechaNacimiento" value={patientForm.fechaNacimiento} onChange={handlePatientChange} style={styles.input} required />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Teléfono</label>
                    <input type="text" name="telefono" value={patientForm.telefono} onChange={handlePatientChange} style={styles.input} required />
                </div>
                <button type="submit" style={styles.button}>Crear Paciente</button>
                </form>
            </div>

            {/* Formulario de Turnos */}
            <div style={styles.formContainer}>
                <h3 style={styles.heading}>Agendar Nuevo Turno</h3>
                <form onSubmit={handleCreateAppointment}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Paciente</label>
                    <select name="paciente" value={appointmentForm.paciente} onChange={handleAppointmentChange} style={styles.select} required>
                        <option value="">Seleccione un paciente</option>
                        {Array.isArray(patients) && patients.map(p => (
                            <option key={p._id} value={p._id}>{p.nombreCompleto} (CI: {p.CI})</option>
                        ))}
                    </select>
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Médico</label>
                    <select name="medico" value={appointmentForm.medico} onChange={handleAppointmentChange} style={styles.select} required>
                        <option value="">Seleccione un médico</option>
                        {medicos.map(m => (
                        <option key={m._id} value={m._id}>{m.username}</option>
                        ))}
                    </select>
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Fecha</label>
                    <input type="date" name="fecha" value={appointmentForm.fecha} onChange={handleAppointmentChange} style={styles.input} required />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Hora (ej: 10:30)</label>
                    <input type="time" name="hora" value={appointmentForm.hora} onChange={handleAppointmentChange} style={styles.input} required />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Motivo</label>
                    <input type="text" name="motivo" value={appointmentForm.motivo} onChange={handleAppointmentChange} style={styles.input} required />
                </div>
                <button type="submit" style={styles.button}>Agendar Turno</button>
                </form>
            </div>
        </div>

        {/* --- Sección 2: Listado de Turnos --- */}
        <div style={styles.listContainer}>
            <h2 style={styles.heading}>Turnos Programados</h2>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Paciente</th>
                        <th style={styles.th}>Médico</th>
                        <th style={styles.th}>Fecha y Hora</th>
                        <th style={styles.th}>Motivo</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.length > 0 ? appointments.map((app) => (
                    <tr key={app._id}>
                        <td style={styles.td}>{app.paciente?.nombreCompleto || 'N/A'}</td>
                        <td style={styles.td}>{app.medico?.username || 'N/A'}</td>
                        <td style={styles.td}>{new Date(app.fecha).toLocaleDateString()} {app.hora}</td>
                        <td style={styles.td}>{app.motivo}</td>
                    </tr>
                    )) : (
                    <tr>
                        <td colSpan={4} style={{...styles.td, textAlign: 'center'}}>No hay turnos programados.</td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>
        </div>
    );
};

// --- Objeto de Estilos ---
const styles: { [key: string]: CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  managementSection: {
    display: 'flex',
    gap: '2rem',
  },
  formContainer: {
    flex: 1,
    padding: '1.5rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  listContainer: {
    flex: 2,
  },
  heading: {
    borderBottom: '2px solid #007bff',
    paddingBottom: '0.5rem',
    marginBottom: '1.5rem',
  },
  error: {
    color: 'red',
    backgroundColor: '#ffebeB',
    padding: '10px',
    borderRadius: '4px',
  },
  message: {
    color: 'green',
    backgroundColor: '#e6ffec',
    padding: '10px',
    borderRadius: '4px',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    border: '1px solid #ddd',
    padding: '8px',
    backgroundColor: '#f2f2f2',
    textAlign: 'left',
  },
  td: {
    border: '1px solid #ddd',
    padding: '8px',
  },
};

export default PanelRecepcionista;