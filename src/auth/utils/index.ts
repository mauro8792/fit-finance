export const rolesTransformer = {
  to: (roles: string[]): string => JSON.stringify(roles),
  from: (rolesStr: string): string[] => {
    try {
      return JSON.parse(rolesStr);
    } catch (error) {
      return ['user'];
    }
  },
};
