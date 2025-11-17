import { useState, useEffect, type CSSProperties } from 'react';
import api from '../services/api';

// --- Definición de Tipos ---
interface Appointment {
    _id: string;
    paciente: { _id: string, nombreCompleto: string };
    medico: { _id: string, username: string };
    fecha: string;
    hora: string;
    motivo: string;
    estado: 'PROGRAMADO' | 'ATENDIDO' | 'CANCELADO' | 'AUSENTE';
}

// --- Componente ---
const PanelMedico = () => {
    // --- Estados ---
    const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Efecto para cargar los turnos ---
    useEffect(() => {
    fetchMyAppointments();
    }, []);

    // --- Cargar mis turnos ---
    // El backend (GET /api/appointments) ya está programado
    // para devolver SOLO los turnos del médico logueado.
    const fetchMyAppointments = async () => {
        try {
        setLoading(true);
        // Solo traemos los que están 'PROGRAMADO'.
        const response = await api.get<Appointment[]>('/appointments?estado=PROGRAMADO');
        setMyAppointments(response.data);
        setError(null);
        } catch (err) {
        setError('Error al cargar los turnos');
        console.error(err);
        } finally {
        setLoading(false);
        }
    };

    // --- Manejador para actualizar estado ---
    const handleUpdateStatus = async (id: string, newStatus: 'ATENDIDO' | 'AUSENTE') => {
        try {
        // Llamamos al endpoint de actualización de estado
        await api.put(`/appointments/${id}/status`, { estado: newStatus });
        
        // Si fue exitoso, eliminamos el turno de la lista local
        // (ya no está 'PROGRAMADO', así que no debe verse)
        setMyAppointments(prev => prev.filter(app => app._id !== id));
        
        } catch (err: any) {
        setError(err.response?.data?.message || 'Error al actualizar el turno');
        console.error(err);
        }
    };

    // --- Renderizado ---
    if (loading) return <div>Cargando mis turnos...</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Mis Turnos Programados</h2>

            {error && <p style={styles.error}>{error}</p>}

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Paciente</th>
                        <th style={styles.th}>Fecha y Hora</th>
                        <th style={styles.th}>Motivo</th>
                        <th style={styles.th}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {myAppointments.length > 0 ? (
                        myAppointments.map((app) => (
                        <tr key={app._id}>
                            <td style={styles.td}>{app.paciente?.nombreCompleto || 'N/A'}</td>
                            <td style={styles.td}>{new Date(app.fecha).toLocaleDateString()} {app.hora}</td>
                            <td style={styles.td}>{app.motivo}</td>
                            <td style={styles.td}>
                                {/* Botones de Acción */}
                                <button
                                    style={{...styles.button, ...styles.buttonAtendido}}
                                    onClick={() => handleUpdateStatus(app._id, 'ATENDIDO')}
                                >
                                    Marcar Atendido
                                </button>
                                <button
                                    style={{...styles.button, ...styles.buttonAusente}}
                                    onClick={() => handleUpdateStatus(app._id, 'AUSENTE')}
                                >
                                    Marcar Ausente
                                </button>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} style={{...styles.td, textAlign: 'center'}}>
                                No tiene turnos programados.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// --- Objeto de Estilos ---
const styles: { [key: string]: CSSProperties } = {
    container: {
        width: '100%',
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
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '1rem',
    },
    th: {
        border: '1px solid #ddd',
        padding: '12px',
        backgroundColor: '#f2f2f2',
        textAlign: 'left',
    },
    td: {
        border: '1px solid #ddd',
        padding: '12px',
    },
    button: {
        padding: '8px 12px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        color: 'white',
        marginRight: '5px',
        fontSize: '14px',
    },
    buttonAtendido: {
        backgroundColor: '#5cb85c', // Verde
    },
    buttonAusente: {
        backgroundColor: '#f0ad4e', // Naranja
    },
};

export default PanelMedico;