export interface User {
  id: number;
  username: string;
  rol: string;
  avatar_url: string | null;
}

export const users: User[] = [
  {
    id: 1,
    username: 'MariaGarcia',
    rol: 'vendedor',
    avatar_url: null,
  },
  {
    id: 2,
    username: 'CarlosLopez',
    rol: 'cliente',
    avatar_url: null,
  },
  {
    id: 3,
    username: 'AnaMartinez',
    rol: 'cliente',
    avatar_url: null,
  },
  {
    id: 4,
    username: 'PedroRamirez',
    rol: 'vendedor',
    avatar_url: null,
  },
  {
    id: 5,
    username: 'LauraHernandez',
    rol: 'cliente',
    avatar_url: null,
  },
];

export const getUserById = (id: number): User | undefined => {
  return users.find((user) => user.id === id);
};

export const getRandomUsername = (): string => {
  const anonymousNames = [
    'Anónimo-4521',
    'Anónimo-7832',
    'Anónimo-2910',
    'Anónimo-8456',
    'Anónimo-1234',
  ];
  return anonymousNames[Math.floor(Math.random() * anonymousNames.length)];
};
