interface SeedRole {
  name: string;
}

interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: string[];
}

interface SeedSport {
  name: string;
  description: string;
  monthlyFee: number;
}

interface SeedStudent {
  firstName: string;
  lastName: string;
  birthDate: string;
  phone: string;
  startDate: string;
  document: string;
  isActive: boolean;
  sportName: string; // Nombre del deporte para buscar la relación
  email: string; // Email para el usuario
  password: string; // Contraseña para el usuario
}


interface SeedCoach {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  salary?: number;
  specialty?: string;
}

interface SeedData {
  roles: SeedRole[];
  users: SeedUser[];
  coaches: SeedCoach[];
  sports: SeedSport[];
  students: (SeedStudent & { coachEmail?: string })[];
}

export const initialData: SeedData = {
  roles: [
    {
      name: 'user',
    },
    {
      name: 'admin',
    },
    {
      name: 'super-admin',
    },
  ],
  users: [
    {
      email: 'admin@fitfinance.com',
      fullName: 'Administrador Principal',
      password: 'Admin123!',
      roles: ['admin', 'super-admin'],
    },
    {
      email: 'user@fitfinance.com',
      fullName: 'Usuario de Prueba',
      password: 'User123!',
      roles: ['user'],
    },
  ],
  coaches: [
    {
      firstName: 'Brian',
      lastName: 'Gómez',
      email: 'brian@fitfinance.com',
      password: 'Coach123!',
      salary: 200000,
      specialty: 'Fuerza',
    },
    {
      firstName: 'Lautaro',
      lastName: 'Pérez',
      email: 'lautaro@fitfinance.com',
      password: 'Coach123!',
      salary: 180000,
      specialty: 'Hipertrofia',
    },
    {
      firstName: 'Mauro',
      lastName: 'Yini',
      email: 'mauro@fitfinance.com',
      password: 'Coach123!',
      salary: 220000,
      specialty: 'Funcional',
    },
  ],
  sports: [
    {
      name: 'Musculación',
      description: 'Entrenamiento con pesas y máquinas para desarrollo muscular',
      monthlyFee: 8500,
    },
    {
      name: 'CrossFit',
      description: 'Entrenamiento funcional de alta intensidad',
      monthlyFee: 12000,
    },
    {
      name: 'Yoga',
      description: 'Práctica de posturas, respiración y meditación',
      monthlyFee: 7000,
    },
    {
      name: 'Pilates',
      description: 'Ejercicios de fortalecimiento y flexibilidad',
      monthlyFee: 7500,
    },
    {
      name: 'Boxeo',
      description: 'Arte marcial y deporte de combate',
      monthlyFee: 9000,
    },
    {
      name: 'Natación',
      description: 'Entrenamiento acuático completo',
      monthlyFee: 10000,
    },
    {
      name: 'Spinning',
      description: 'Ciclismo indoor con música y coreografía',
      monthlyFee: 6500,
    },
    {
      name: 'Zumba',
      description: 'Baile fitness con ritmos latinos',
      monthlyFee: 6000,
    },
    {
      name: 'Funcional',
      description: 'Entrenamiento funcional con peso corporal',
      monthlyFee: 7500,
    },
    {
      name: 'Artes Marciales',
      description: 'Karate, Taekwondo y otras disciplinas marciales',
      monthlyFee: 8000,
    },
    {
      name: 'Calistenia',
      description: 'Ejercicios con peso corporal al aire libre',
      monthlyFee: 7000,
    },
    {
      name: 'Aqua Aeróbicos',
      description: 'Ejercicios aeróbicos en el agua',
      monthlyFee: 8500,
    },
  ],
  students: [
    // Brian's students
    { firstName: 'Carlos', lastName: 'González', birthDate: '1995-03-15', phone: '2235551234', startDate: '2025-01-15', document: '12345678', isActive: true, sportName: 'Musculación', email: 'carlos.gonzalez@fitfinance.com', password: 'Student123!', coachEmail: 'brian@fitfinance.com' },
    { firstName: 'María', lastName: 'Rodríguez', birthDate: '1992-07-22', phone: '2235555678', startDate: '2025-02-01', document: '23456789', isActive: true, sportName: 'Yoga', email: 'maria.rodriguez@fitfinance.com', password: 'Student123!', coachEmail: 'brian@fitfinance.com' },
    { firstName: 'Juan', lastName: 'Pérez', birthDate: '1988-11-10', phone: '2235559876', startDate: '2024-12-10', document: '34567890', isActive: true, sportName: 'CrossFit', email: 'juan.perez@fitfinance.com', password: 'Student123!', coachEmail: 'brian@fitfinance.com' },
    { firstName: 'Ana', lastName: 'Martínez', birthDate: '1990-05-08', phone: '2235554321', startDate: '2025-01-20', document: '45678901', isActive: true, sportName: 'Pilates', email: 'ana.martinez@fitfinance.com', password: 'Student123!', coachEmail: 'brian@fitfinance.com' },
    { firstName: 'Diego', lastName: 'López', birthDate: '1993-09-14', phone: '2235558765', startDate: '2025-02-15', document: '56789012', isActive: true, sportName: 'Boxeo', email: 'diego.lopez@fitfinance.com', password: 'Student123!', coachEmail: 'brian@fitfinance.com' },
    // Lautaro's students
    { firstName: 'Sofía', lastName: 'Fernández', birthDate: '1991-01-25', phone: '2235552468', startDate: '2025-01-08', document: '67890123', isActive: true, sportName: 'Natación', email: 'sofia.fernandez@fitfinance.com', password: 'Student123!', coachEmail: 'lautaro@fitfinance.com' },
    { firstName: 'Mateo', lastName: 'Silva', birthDate: '1994-12-03', phone: '2235557890', startDate: '2025-02-20', document: '78901234', isActive: true, sportName: 'Spinning', email: 'mateo.silva@fitfinance.com', password: 'Student123!', coachEmail: 'lautaro@fitfinance.com' },
    { firstName: 'Valentina', lastName: 'Torres', birthDate: '1989-06-18', phone: '2235553456', startDate: '2024-11-25', document: '89012345', isActive: true, sportName: 'Zumba', email: 'valentina.torres@fitfinance.com', password: 'Student123!', coachEmail: 'lautaro@fitfinance.com' },
    { firstName: 'Lucas', lastName: 'Herrera', birthDate: '1996-08-07', phone: '2235556789', startDate: '2025-01-30', document: '90123456', isActive: true, sportName: 'Funcional', email: 'lucas.herrera@fitfinance.com', password: 'Student123!', coachEmail: 'lautaro@fitfinance.com' },
    { firstName: 'Camila', lastName: 'Morales', birthDate: '1987-04-12', phone: '2235551357', startDate: '2025-02-05', document: '01234567', isActive: true, sportName: 'Artes Marciales', email: 'camila.morales@fitfinance.com', password: 'Student123!', coachEmail: 'lautaro@fitfinance.com' },
    // Mauro's students
    { firstName: 'Sebastián', lastName: 'Vargas', birthDate: '1992-10-28', phone: '2235559753', startDate: '2025-01-12', document: '11234567', isActive: true, sportName: 'Calistenia', email: 'sebastian.vargas@fitfinance.com', password: 'Student123!', coachEmail: 'mauro@fitfinance.com' },
    { firstName: 'Isabella', lastName: 'Castro', birthDate: '1986-02-14', phone: '2235558642', startDate: '2024-12-18', document: '22234567', isActive: true, sportName: 'Aqua Aeróbicos', email: 'isabella.castro@fitfinance.com', password: 'Student123!', coachEmail: 'mauro@fitfinance.com' },
    { firstName: 'Pedro', lastName: 'Ramírez', birthDate: '1993-03-22', phone: '2235551111', startDate: '2025-01-10', document: '33334444', isActive: true, sportName: 'Musculación', email: 'pedro.ramirez@fitfinance.com', password: 'Student123!', coachEmail: 'mauro@fitfinance.com' },
    { firstName: 'Florencia', lastName: 'Sosa', birthDate: '1995-09-17', phone: '2235552222', startDate: '2025-02-12', document: '55556666', isActive: true, sportName: 'Yoga', email: 'florencia.sosa@fitfinance.com', password: 'Student123!', coachEmail: 'mauro@fitfinance.com' },
    { firstName: 'Tomás', lastName: 'Iglesias', birthDate: '1990-06-30', phone: '2235553333', startDate: '2025-01-25', document: '77778888', isActive: true, sportName: 'CrossFit', email: 'tomas.iglesias@fitfinance.com', password: 'Student123!', coachEmail: 'mauro@fitfinance.com' },
  ],
};
