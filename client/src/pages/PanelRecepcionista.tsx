import { useState, useEffect, type CSSProperties} from "react";
import api from "../services/api";

// Defición de tipos
interface Patient {
    _id: string;
    nombreCompleto: string;
    CI: string;
    telefono: string;
    fechaNacimiento: string;
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
    // --- Estados de datos ---
    const [patients, setPatients] = useState<Patient[]>([]);
    const [medicos, setMedicos] = useState<Medico[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    // Estadis de UI
    const [tab, setTab] = useState< 'CREAR' |'TURNOS' | 'PACIENTES'>('TURNOS');
    const [editingId, setEditingId] = useState<string | null>(null); // ID del turno o paciente en edición

    // Filtros
    const [filterMedico, setFilterMedico] = useState<string>('');
    const [filterEstado, setFilterEstado] = useState<string>('');

    const [loading, setLoading] = useState(true);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // estados para los formularios
    const [patientForm, setPatientForm] = useState({
        nombreCompleto: '',
        CI: '',
        fechaNacimiento: '',
        telefono: '',
    });

    // estado para el formulario de turnos sirve para crear y editar
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
        buscarTurnos();
    }, []);

    // --- Función para cargar datos desde la API ---
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
            // hacemos las 2 peticiones en paralelo
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

    // --- Función para buscar turnos (inicial y con filtros) ---
    const buscarTurnos = async () => {
        setLoadingPatients(true);
        // cargar turnos con filtros
        try {
            let url = '/appointments?';
            if (filterMedico) url += `medicoId=${filterMedico}&`;
            if (filterEstado) url += `estado=${filterEstado}&`;

            const res = await api.get(url);
            const data = Array.isArray(res.data) ? res.data : (res.data.appointments || []);
            setAppointments(data);

        } catch (error) {
            console.error("Error cargando turnos con filtros:", error);
        } finally {
            setLoadingPatients(false);
        }
    }


    // ------ manejadores de formularios ------
    const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPatientForm({ ...patientForm, [e.target.name]: e.target.value }); // soporta solo input
    }

    // ------- Manejador de formulario de turnos ------
    const handleAppointmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setAppointmentForm({ ...appointmentForm, [e.target.name]: e.target.value }); // soporta input y select
    }

    // ------ Manejador: Crear Paciente ------
    const handleCreatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        try {

            const payload = {
                ...patientForm,
                fechaNacimiento: patientForm.fechaNacimiento ? `${patientForm.fechaNacimiento}T12:00:00` : ''
            }

            const response = await api.post<Patient>('/patients', payload);
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

    // --- manejador de cancelar Appointment ---
    const handleCancelAppointment = async (id: string) => {
        if (!confirm("¿Está seguro de que desea cancelar este turno?")) return;

        try {
            //usamos el nuevo endpoint PUT general, enviando solo el estado
            await api.put(`/appointments/${id}`, { estado: 'CANCELADO' });
            fetchData(); // refrescar datos

        } catch (error) {
            alert('Error al cancelar el turno');
            console.error(error);
        }
    };

    // --- Manejador para iniciar edición de turno ---
    const handleEditClick = (app: Appointment) => {
        setEditingId(app._id);
        // Rellenar el fomulario con los datos del turno seleccionado
        setAppointmentForm({
            paciente: app.paciente._id,
            medico: app.medico._id,
            fecha: app.fecha.split('T')[0], // extraer solo la parte de la fecha
            hora: app.hora,
            motivo: app.motivo,
        });
        window.scrollTo(0, 0); // subir al tope para ver el formulario
    };

    const handleSubmitTurno = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...appointmentForm,
            fecha: appointmentForm.fecha ? `${appointmentForm.fecha}T12:00:00` : ''
        }
        try {
            if (editingId) {
                // MODO EDICIÓN
                await api.put(`/appointments/${editingId}`, payload);
                alert('Turno actualizado con éxito');
                setEditingId(null);
            } else {
                // MODO CREACIÓN
                await api.post('/appointments', payload);
                alert('Turno creado éxito');
            }
            // limpiar y recargar
            setAppointmentForm({ paciente: '', medico: '', fecha: '', hora: '', motivo: '' });
            fetchData();
        } catch (error) {
            alert('Error al guardar el turno');
            console.error(error);
        }
    }

    // --- Renderizado ---
    if (loading) return <div>Cargando datos del panel...</div>;

    return (
        <div style={styles.container}>
            {/* Mensajes Globales */}
            {error && <p style={styles.error}>{error}</p>}
            {message && <p style={styles.message}>{message}</p>}
            
            {/* --- BARRA DE NAVEGACIÓN (PESTAÑAS) --- */}
            <div style={{marginBottom: '20px'}}>
                <button onClick={() => setTab('CREAR')} style={tab === 'CREAR' ? styles.activeTab : styles.tab}>Registrar Paciente</button>
                <button onClick={() => setTab('TURNOS')} style={tab === 'TURNOS' ? styles.activeTab : styles.tab}>Gestión de Turnos</button>
                <button onClick={() => setTab('PACIENTES')} style={tab === 'PACIENTES' ? styles.activeTab : styles.tab}>Listado de Pacientes</button>
            </div>
            {tab === 'PACIENTES' && (
                <div>
                    <h3>Listado Completo de Pacientes</h3>
                    {/* Aquí cumples el requisito: Listar Pacientes */}
                    <table style={styles.table}>
                        <thead><tr><th>Nombre</th><th>CI</th><th>Teléfono</th><th>Fecha Nacimiento</th></tr></thead>
                        <tbody>
                            {patients.map(p => (
                                <tr key={p._id}>
                                    <td style={styles.td}>{p.nombreCompleto}</td>
                                    <td style={styles.td}>{p.CI}</td>
                                    <td style={styles.td}>{p.telefono}</td>
                                    <td style={styles.td}>{new Date(p.fechaNacimiento).toLocaleDateString('es-BO', { timeZone: 'UTC' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {tab === 'CREAR' && (
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
                </div>
            )}
            {tab === 'TURNOS' && (
                <div>
                    {/* Formulario de Turnos */}
                    <div style={styles.formContainer}>
                        <h3 style={styles.heading}>{editingId ? 'Modificar Turno' : 'Agendar Nuevo Turno'}</h3>
                        <form onSubmit={handleSubmitTurno}>
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
                            <button type="submit" style={styles.button}>{editingId ? 'Guardar Cambios' : 'Agendar Turno'}</button>
                            {editingId && (
                                <button type="button" onClick={() => {setEditingId(null); setAppointmentForm({paciente:'', medico:'', fecha:'', hora:'', motivo:''})}} style={{...styles.button, background: '#ccc', marginTop:'10px'}}>
                                    Cancelar Edición
                                </button>
                            )}
                        </form>
                    </div>

                    {/* --- Sección 2: Listado de Turnos y Filtros --- */}
                    <div style={styles.listContainer}>
                        {/* Encabezado */}
                        <h2 style={styles.heading}>Turnos Programados</h2>

                        {/* Filtrar por turnos */}
                        <div style={styles.filtro}>
                            <strong style={{ display: "block", marginBottom: 8, color: "#0f172a" }}>
                                Filtrar Turnos
                            </strong>

                            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                                <div style={{ flex: "1 1 220px", minWidth: 160 }}>
                                    <label style={{ ...styles.label, marginBottom: 6 }}>Médico</label>
                                    <select
                                        onChange={(e) => setFilterMedico(e.target.value)}
                                        style={styles.select}
                                        value={filterMedico}
                                    >
                                        <option value="">Todos los medicos</option>
                                        {medicos.map((m) => (
                                        <option key={m._id} value={m._id}>
                                            {m.username}
                                        </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ flex: "1 1 180px", minWidth: 140 }}>
                                    <label style={{ ...styles.label, marginBottom: 6 }}>Estado</label>
                                    <select
                                        onChange={(e) => setFilterEstado(e.target.value)}
                                        style={styles.select}
                                        value={filterEstado}
                                    >
                                        <option value="">Todos los estados</option>
                                        <option value="PROGRAMADO">PROGRAMADO</option>
                                        <option value="ATENDIDO">ATENDIDO</option>
                                        <option value="CANCELADO">CANCELADO</option>
                                        <option value="AUSENTE">AUSENTE</option>
                                    </select>
                                </div>

                                <div style={{ display: "flex", alignItems: "flex-end" }}>
                                <button
                                    onClick={buscarTurnos}
                                    type="button"
                                    style={{
                                    ...styles.button,
                                    width: "auto",
                                    padding: "10px 14px",
                                    borderRadius: 10,
                                    fontSize: 14,
                                    minHeight: 42,
                                    }}
                                >
                                    Aplicar Filtros
                                </button>
                                </div>
                            </div>
                        </div>


                        <table style={styles.table}>
                            {loadingPatients ? <div>Cargando turnos Programados...</div> : (
                            <>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Paciente</th>
                                    <th style={styles.th}>Médico</th>
                                    <th style={styles.th}>Fecha y Hora</th>
                                    <th style={styles.th}>Motivo</th>
                                    <th style={styles.th}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.length > 0 ? appointments.map((app) => (
                                <tr key={app._id}>
                                    <td style={styles.td}>{app.paciente?.nombreCompleto || 'N/A'}</td>
                                    <td style={styles.td}>{app.medico?.username || 'N/A'}</td>
                                    <td style={styles.td}>{new Date(app.fecha).toLocaleDateString('es-BO', { timeZone: 'UTC' })} {app.hora}</td>
                                    <td style={styles.td}>{app.motivo}</td>
                                    <td style={styles.td}>{app.estado}</td>
                                    <td style={styles.td}>
                                        {app.estado === 'PROGRAMADO' && (
                                            <>
                                                <button 
                                                    onClick={() => handleEditClick(app)} 
                                                    style={styles.editButton}
                                                    type="button"
                                                >
                                                    <span style={styles.iconSmall}>✏️</span>
                                                    <span style={{display: "none"}}>Editar</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleCancelAppointment(app._id)} 
                                                    style={styles.cancelButton}
                                                    type="button"
                                                >
                                                    <span style={styles.iconSmall}>🚫</span>
                                                    <span style={{display: "none"}}>Cancelar</span>
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                                )) : (
                                <tr>
                                    <td colSpan={4} style={{...styles.td, textAlign: 'center'}}>No hay turnos programados.</td>
                                </tr>
                                )}
                            </tbody>
                            </>
                            )}
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Objeto de Estilos ---
const styles: { [key: string]: CSSProperties } = {
    container: {
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        maxWidth: 1200,
        margin: "2.5rem auto",
        fontFamily:
        "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    },
    managementSection: {
        display: "flex",
        gap: "2rem",
        alignItems: "flex-start",
    },
    formContainer: {
        flex: 1,
        padding: "1.5rem",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(250,250,255,0.95))",
        boxShadow: "0 10px 30px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
        border: "1px solid rgba(16,24,40,0.04)",
    },
    listContainer: {
        flex: 2,
        padding: "1.25rem",
        borderRadius: 12,
        background: "linear-gradient(180deg, #ffffff, #fbfbff)",
        boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
        border: "1px solid rgba(16,24,40,0.04)",
    },
    heading: {
        borderBottom: "2px solid rgba(99,102,241,0.18)",
        paddingBottom: "0.5rem",
        marginBottom: "1.25rem",
        color: "#0f172a",
        fontSize: 18,
        fontWeight: 700,
    },
    error: {
        color: "#7f1d1d",
        backgroundColor: "#ffefef",
        border: "1px solid #fca5a5",
        padding: "10px 12px",
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 13,
    },
    message: {
        color: "#064e3b",
        backgroundColor: "#ecfdf5",
        border: "1px solid #bbf7d0",
        padding: "10px 12px",
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 13,
    },
    inputGroup: {
        marginBottom: "14px",
    },
    label: {
        display: "block",
        marginBottom: 6,
        fontSize: 13,
        color: "#0f172a",
        fontWeight: 600,
    },
    input: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid rgba(15,23,42,0.08)",
        background: "linear-gradient(180deg, #fff, #fbfbff)",
        outline: "none",
        boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
        fontSize: 14,
        transition: "box-shadow 160ms ease, border-color 160ms ease, transform 160ms ease",
        boxSizing: "border-box",
    },
    select: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid rgba(15,23,42,0.08)",
        background: "white",
        fontSize: 14,
        boxSizing: "border-box",
    },
    button: {
        width: "100%",
        padding: "12px",
        background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
        color: "white",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: "0.2px",
        boxShadow: "0 8px 20px rgba(99,102,241,0.18)",
        transition: "transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 14,
        color: "#0f172a",
    },
    th: {
        border: "1px solid rgba(15,23,42,0.06)",
        padding: "10px 12px",
        backgroundColor: "#f8fafc",
        textAlign: "left",
        fontWeight: 700,
    },
    td: {
        border: "1px solid rgba(15,23,42,0.04)",
        padding: "10px 12px",
        verticalAlign: "middle",
    },
    filtro: {
        marginBottom: "15px",
        padding: "10px",
        background: "linear-gradient(90deg, rgba(249,250,255,0.7), rgba(243,244,255,0.9))",
        borderRadius: 10,
        border: "1px solid rgba(15,23,42,0.04)",
    },
    tab: {
        padding: "10px 20px",
        cursor: "pointer",
        background: "linear-gradient(90deg, #eef2ff, #f8fafc)",
        border: "none",
        marginRight: "8px",
        borderRadius: 10,
        fontWeight: 600,
        color: "#0f172a",
        boxShadow: "0 4px 10px rgba(15,23,42,0.03)",
    },
    activeTab: {
        padding: "10px 20px",
        cursor: "pointer",
        background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
        color: "white",
        border: "none",
        marginRight: "8px",
        borderRadius: 10,
        fontWeight: 700,
        boxShadow: "0 8px 20px rgba(99,102,241,0.14)",
    },
    filterRow: {
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
    },
    filterButton: {
        width: "auto",
        padding: "10px 14px",
        borderRadius: 10,
        fontSize: 14,
    },
    editButton: {
        padding: "8px 10px",
        borderRadius: 10,
        border: "none",
        background: "linear-gradient(90deg,#eef2ff,#c7d2fe)",
        color: "#0f172a",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.6)",
        fontSize: 14,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    cancelButton: {
        padding: "8px 10px",
        borderRadius: 10,
        border: "none",
        background: "linear-gradient(90deg,#ffefef,#f4c4c4)",
        color: "#a71c1cff",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.6)",
        fontSize: 14,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    iconSmall: {
        fontSize: 14,
        lineHeight: 1,
    }
};


export default PanelRecepcionista;