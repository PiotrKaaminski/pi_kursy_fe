// Bootstrap CSS & Bundle JS
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

import React from 'react';
import '../App.css';
import { useLoginMutation } from "./api";
import { useCallback, useMemo } from "react";

import {
  Routes,
    Route,
    useNavigate,
    useLocation,
    Navigate,
    Outlet
} from "react-router-dom";
import { RegisterPage, CoursesPage, CourseDetailsPage, CreateCoursePage } from "./pages";

import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient()

export default function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route
                  path="/register"
                  element={
                    <RegisterPage />
                  }
              />
              <Route
                  path="/"
                  element={<CoursesPage />}
              />
              <Route
                  path="/courses/:id"
                  element={<CourseDetailsPage />}
              />
              <Route
                  path="/courses-create"
                  element={
                    <RequireAuth>
                      <CreateCoursePage />
                    </RequireAuth>
                  }
              />
              <Route
                  path="/courses/:id"
                  element={<CourseDetailsPage />}
              />
            </Route>
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
  );
}

function Layout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation()

  return (
      <>
        {location.pathname !== '/login' && location.pathname !== '/register' && (<div className="bg-white">
          {!auth.token && (<Button type="button" className="btn-lg btn-success m-3" onClick={() => navigate('/login')}>
            Zaloguj się
          </Button>)}
          {auth.token && (<Button type="button" className="btn-lg btn-danger m-3" onClick={() => navigate('/login')}>
            Wyloguj się
          </Button>)}
        </div>)}
        <Outlet /></>
  );
}

interface AuthContextType {
  userId: string;
  token: string;
  signin: (username: string, password: string) => void;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
}

enum Role {
  ROLE_STUDENT = 'STUDENT',
  ROLE_TEACHER = 'TEACHER',
  ROLE_ADMIN = 'ADMIN'
}

interface IResponseLogin {
  data: {
    id: string;
    token: string;
    role: Role;
    username: string;
  }
}

const AuthContext = React.createContext<AuthContextType>(null!);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = React.useState<any>();
  const [token, setToken] = React.useState<any>();
  const [username, setUsername] = React.useState<any>();
  const [role, setRole] = React.useState<any>();

  const navigate = useNavigate();
  const location = useLocation();

  const defaultAuthorizedPathname = '/';
  const from = location.state?.from?.pathname || defaultAuthorizedPathname;

  const { mutate: login } = useLoginMutation({
    onSuccess: (res: IResponseLogin) => {
      setUserId(res?.data?.id);
      setToken("Bearer " + res?.data?.token);
      setUsername(res?.data?.username);
      setRole(res?.data?.role);
      navigate(from, { replace: true });
    },
    onError: (error: Error) => {
      console.log(error);
    }
  });

  const signin = useCallback(async(username: string, password: string) => {
    login({
      username: username,
      password: password
    })
  }, [login]);

  const isStudent = role === "STUDENT";
  const isTeacher = role === "TEACHER";
  const isAdmin = role === "ADMIN";

  const value = useMemo(() => {
    return {
      userId, token, signin, username, role, isStudent, isTeacher, isAdmin
    }
  }, [role, signin, token, username, isAdmin, isStudent, isTeacher])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

function RequireAuth({ children }: { children: any }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (formData: any) => {
    formData.preventDefault();
    formData.stopPropagation();

    const username = formData.target[0].value;
    const password = formData.target[1].value;

    auth.signin(username, password);

    formData.target.reset();
  };

  return (
      <Container className="h-100 d-flex justify-content-center align-items-center">
        <Form onSubmit={handleSubmit}>
          <Row className="bg-white p-5 rounded">
            <Form.Group as={Col} xs="12">
              <h1 className="text-center pb-5">Logowanie</h1>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicLogin" as={Col} xs="6">
              <Form.Label>Login</Form.Label>
              <Form.Control type="text" name="username" placeholder="Login" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword" as={Col} xs="6">
              <Form.Label>Hasło</Form.Label>
              <Form.Control type="password" name="password" placeholder="Password" required />
            </Form.Group>
            <Form.Group as={Col} xs="12" className="text-center mb-3">
              <Button type="submit" className="btn-lg w-50 m-3">
                Zaloguj się
              </Button>
            </Form.Group>
            <Form.Group as={Col} xs="12" className="text-center mb-3">
              <Button type="button" className="btn-lg m-3 w-49 " variant="light" onClick={() => navigate('/register')}>
                Rejestracja
              </Button>
              <Button type="button" className="btn-lg w-49 m-3" variant="light" onClick={() => navigate('/')}>
                Powrót do listy kursów
              </Button>
            </Form.Group>
          </Row>
        </Form>
      </Container>
  );
}
