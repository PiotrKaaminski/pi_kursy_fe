import { useState, useEffect } from 'react';
import { Button, Col, Container, Form, Row, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

function CreateCoursePage() {
    const navigate = useNavigate();
    const auth = useAuth();

    const [isSuccess, setSuccess] = useState<boolean>(false);
    const [isError, setError] = useState<boolean>(false);
    const defaultCategory = {id: ''}
    const [categories, setCategories] = useState([defaultCategory]);
    const [availableCategories, setAvailableCategories] = useState<any[]>();
    const [availableTeachers, setAvailableTeachers] = useState<any[]>();


    const fetchData = async (e?: any) => {
        const categoriesResponse = await fetch('http://localhost:8080/categories')
        const categoriesJson = await categoriesResponse.json();
        setAvailableCategories(categoriesJson.rows);

        const teachersResponse = await fetch('http://localhost:8080/users?role=TEACHER', {
            headers: {
                'Authorization': auth?.token
            }
        })
        const teachersJson = await teachersResponse.json();
        setAvailableTeachers(teachersJson.rows);
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        setSuccess(false);
        setError(false);

        let categoryIds = new Set<string>();
        categories.forEach((category) => categoryIds.add(category.id));

        const body = {
            name: event.target[1].value,
            price: event.target[3].value,
            categoryIds: Array.from(categoryIds),
            teacherId: event.target[2].value,
            description: event.target[4].value
        }
        try {
            await fetch(`http://localhost:8080/courses`, {
                method: 'POST',
                headers: {
                    'Authorization': auth?.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }).then((response) => {
                console.log('response: ', response);
                response.ok ? setSuccess(true) : setError(true);
            })
        } catch (error) {
            console.error(error);
        }
    };

    const addCategory = () => {
        setCategories([...categories, { ...defaultCategory }]);
    };

    const onChangeCategory = (index: number) => ({ target: { value, name } }: any) => {
        const newCategory = categories.map((category, _index) =>
            _index === index ? { ...category, 'id': value } : category
        );
        setCategories(newCategory);
    };

    const removeCategory = (index: number) => {
        if (categories.length === 1) {
            return;
        }
        const newCategories = categories.filter((_, i) => i !== index);
        setCategories(newCategories);
    };

    return (
        <section id="createRecipe">
            <Container className="h-100 d-flex justify-content-center align-items-center flex-direction-column">
                <Form onSubmit={handleSubmit}>
                    <Button type="button" className="btn-lg my-5" onClick={() => navigate('/')}>
                        Powrót do listy kursów
                    </Button>
                    <Row className="bg-white p-5 rounded">
                        <Form.Group as={Col} xs="12">
                            <h1 className="text-center pb-5">Tworzenie nowego kursu</h1>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicName" as={Col} xs="12">
                            <Form.Label>Nazwa</Form.Label>
                            <Form.Control type="text" name="name" placeholder="Nazwa" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicTeacher" as={Col} xs="6">
                            <Form.Label>Prowadzący</Form.Label>
                            <Form.Select name="teacher" required>
                                <option value="" selected></option>
                                {availableTeachers?.map((teacher) => {
                                    return <option value={teacher.id}>{teacher.username}</option>
                                })}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicPrice" as={Col} xs="6">
                            <Form.Label>Cena</Form.Label>
                            <Form.Control type="number" name="price" min="0" required />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicDescription" as={Col} xs="12">
                            <Form.Label>Opis</Form.Label>
                            <Form.Control as="textarea" rows={3} name="description" required />
                        </Form.Group>
                        <strong>Kategorie:</strong>
                        {categories.map((_: any, index: number) => (
                            <div key={index}>
                                    <Form.Group as={Row} controlId="formGridName" className="d-flex align-items-end mt-3">
                                        <Form.Group as={Col} xs="6">
                                            <Form.Select name="category" onChange={onChangeCategory(index)} required>
                                                <option value="" selected></option>
                                                {availableCategories?.map((category) => {
                                                    return <option value={category.id}>{category.name}</option>
                                                })}
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group as={Col} xs="2">
                                            {categories.length > 1 && (
                                                <Button variant="danger" onClick={() => removeCategory(index)}>
                                                    Usuń
                                                </Button>
                                            )}
                                        </Form.Group>
                                    </Form.Group>
                            </div>
                        ))}
                        <Button onClick={addCategory} variant="success" className="w-auto mt-3">Dodaj nową kategorię</Button>
                        <Form.Group as={Col} xs="12" className="mt-5">
                            <Button type="submit" className="btn-lg w-auto m-3">
                                Zapisz
                            </Button>
                        </Form.Group>
                    </Row>
                </Form>
                <Toast show={isSuccess} onClose={() => setSuccess(false)}>
                    <Toast.Header>
                        <strong>Tworzenie</strong>
                    </Toast.Header>
                    <Toast.Body>:)</Toast.Body>
                </Toast>
                <Toast show={isError} onClose={() => setError(false)}>
                    <Toast.Header>
                        <strong>Tworzenie</strong>
                    </Toast.Header>
                    <Toast.Body>:(</Toast.Body>
                </Toast>
            </Container>
        </section>
    );
}

export default CreateCoursePage;
