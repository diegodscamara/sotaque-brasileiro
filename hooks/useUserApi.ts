import { useCallback, useState } from "react";

import { User } from "@supabase/supabase-js";

const useUserApi = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUser = useCallback(
    async (userId: string) => {
      if (user && user.id === userId) {
        return user;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/users/get?id=${userId}`);
        const data = await response.json();
        if (data && data.length > 0) {
          setUser(data[0]);
        }
        return data[0];
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users/get");
      const data = await response.json();
      setUsers(data);
      return data;
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const editUser = useCallback(async (userId: string, userData: User) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, userData }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    users,
    loading,
    error,
    getUser,
    editUser,
    deleteUser,
    getUsers,
  };
};

export default useUserApi;
