interface SeedRole {
  name: string;
}


interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: string[];
}

interface SeedData {
  roles: SeedRole[];
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
};
