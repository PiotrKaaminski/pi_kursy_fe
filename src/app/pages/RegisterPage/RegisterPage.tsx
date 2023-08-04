import { useState } from 'react';
import { Button, Col, Container, Form, Row, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const navigate = useNavigate();

    const [isSuccess, setSuccess] = useState<boolean>(false);
    const [isError, setError] = useState<boolean>(false);

    const handleSubmit = async (formData: any) => {
        setSuccess(false);
        setError(false);

        formData.preventDefault();
        formData.stopPropagation();
    
        const username = formData.target[0].value;
        const password = formData.target[1].value;
        const role = formData.target[2].value;

        try {
            await fetch(`http://localhost:8080/users/register`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    role
                })
            }).then((response) => { 
                console.log('response: ', response);
                response.ok ? setSuccess(true) : setError(true);
            })
        } catch (error) {
            console.error(error);
        }

        formData.target.reset();
    };
      
        return (
            <Container className="h-100 d-flex justify-content-center align-items-center">
                <Form onSubmit={handleSubmit}>
                    <Row className="bg-white p-5 rounded">
                        <Form.Group as={Col} xs="12">
                            <h1 className="text-center pb-5">Rejestracja</h1>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicLogin" as={Col} xs="6">
                            <Form.Label>Login</Form.Label>
                            <Form.Control type="text" name="username" placeholder="Login" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPassword" as={Col} xs="6">
                            <Form.Label>Hasło</Form.Label>
                            <Form.Control type="password" name="password" placeholder="Hasło" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicRole" as={Col} xs="6">
                            <Form.Label>Rola</Form.Label>
                            <Form.Select name="role" required>
                                <option value="STUDENT">Student</option>
                                <option value="TEACHER">Nauczyciel</option>
                                <option value="ADMIN">Administrator</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group as={Col} xs="12" className="text-center mb-3">
                            <Button type="submit" className="btn-lg w-50 m-3">
                                Zatwierdź
                            </Button>
                            <Button type="button" className="btn-lg w-50 m-3" variant="light" onClick={() => navigate('/login')}>
                                Logowanie
                            </Button>
                        </Form.Group>
                    </Row>
                </Form>
                <Toast show={isSuccess} onClose={() => setSuccess(false)}>
                    <Toast.Header>
                        <strong>Rejestracja</strong>
                    </Toast.Header>
                    <Toast.Body>:)</Toast.Body>
                </Toast>
                <Toast show={isError} onClose={() => setError(false)}>
                    <Toast.Header>
                        <strong>Rejestracja</strong>
                    </Toast.Header>
                    <Toast.Body>:(</Toast.Body>
                </Toast>
            </Container>
        );
}

export default RegisterPage;
