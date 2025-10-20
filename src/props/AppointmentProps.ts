export interface AppointmentProps {
    id: string;
    patient_id: string;
    doctor_id: string;
    appoint_date: Date;
    status: string;
    detail: string;
    patient: {
        id: string;
        hospital_number: string;
        user_patient_idTouser: {
            name: string;
            lastname: string;
        }
    }
}