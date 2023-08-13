import { useEffect, useState } from 'react';
import {Button, Col, Container, Form, Row} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../App';
import parse from 'html-react-parser';

interface ITableRow {
    id: string;
    name: string;
    price: number;
    description: string;
    hasAccess: boolean;
    teacher: {
        id: string;
        username: string;
    };
    categories: [{
       id: string;
       name: string;
    }];
    sections: [{
       id: string;
       title: string;
       sequence: number;
    }];
}

function CourseDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const auth = useAuth();
    const [data, setData] = useState<ITableRow>();
    const [refresh, refreshData] = useState<any>();

    const getRecipe = async () => {
        try {
            const response = await fetch(`http://localhost:8080/courses/${id}`, {
                headers: {
                    'Authorization': auth?.token
                }
            });
            const jsonData = await response.json();
            setData(jsonData);
        } catch (error) {
            console.error(error);
        }
    };

    const buyCourse = async (event: any) => {
        try {
            await fetch(`http://localhost:8080/courses/${id}/buy`, {
                method: 'POST',
                headers: {
                    'Authorization': auth?.token
                }
            }).then((response) => {
                refreshData(response)
            })
        } catch (error) {
            console.error(error);
        }
    }


    useEffect(() => {
        getRecipe();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [id, refresh]);

    const saveSection = (event: any) => {
        event.preventDefault();

        const body = {
            title: event.target[0].value
        }

        console.log(body);

        try {
            fetch(`http://localhost:8080/courses/${data?.id}/sections`, {
                method: 'POST',
                headers: {
                    'Authorization': auth?.token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            }).then((response) => {
                console.log('response: ', response);
                event.target[0].value = '';
                getRecipe();
            })
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <Container className="">
                <Button type="button" className="btn-lg my-5" onClick={() => navigate('/')}>
                    Powrót do listy kursów
                </Button>
                <Row key={data?.id}>
                    <Col xs={9}>
                        <h1 className="pb-5">{data?.name}</h1>
                    </Col>
                    <Col xs={3}>
                        {data?.hasAccess ? (<h2 style={{color: "green"}}>Masz dostęp</h2>) :
                            (!auth.token ? (<h2>Zaloguj się aby kupić kurs</h2>) :
                                    <Button type="button" className="btn-lg btn-primary" onClick={buyCourse}>
                                        Kup kurs {data?.price} zł
                                    </Button>
                            )
                        }
                    </Col>
                    <Col xs={12}>
                        <h3 className="pt-3">Prowadzący: {data?.teacher.username}</h3>
                        <h3 className="pt-3">Kategorie:</h3>
                        <ul>
                            {data?.categories.map((category) => {
                                return (
                                    <>
                                        <li key={category.id}>{category.name}</li>
                                    </>
                                )
                            })}
                        </ul>
                        <p className="pt-3" style={{fontSize: "25px"}}>
                            {data && parse(data.description)}
                        </p>
                        {data?.sections.sort((a, b) => a.sequence - b.sequence)
                            .map((section, index) => {
                            return (
                                <div key={section.id} className="mt-2 p-1" style={{width: "100%", backgroundColor: "silver", fontSize: "30px"}}>
                                    {index + 1}. {section.title}
                                </div>
                            )
                        })}
                        {
                            (data?.teacher.id === auth.userId) && (
                                <Form onSubmit={saveSection}>
                                <Form.Group as={Row} controlId="formGridName" className="d-flex align-items-end mt-3">
                                    <Form.Group as={Col} xs="6">
                                        <Form.Control type="text" name="sectionName" placeholder="Nazwa sekcji" required />
                                    </Form.Group>
                                    <Form.Group as={Col} xs="2">
                                        <Button variant="success" type="submit">
                                            Zapisz
                                        </Button>
                                    </Form.Group>
                                </Form.Group>
                                </Form>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default CourseDetailsPage;
