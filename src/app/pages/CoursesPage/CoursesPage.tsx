import { useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Form, Row, ToggleButton } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

interface ITableRow {
    id: string;
    name: string;
    price: number;
    teacher: {
        id: string;
        username: string;
    };
    categories: ICategory[];
}

interface ICategory {
    id: string;
    name: string;
}

function CoursesPage() {
  const [data, setData] = useState<ITableRow[]>([]);
  const [checked, setChecked] = useState<boolean>();
  const [refresh, refreshData] = useState<any>();
  const [categories, setCategories] = useState<ICategory[]>();

  const auth = useAuth();
  const navigate = useNavigate();

  const order = useMemo(() => (
    checked ? 'ASC' : 'DESC'
  ), [checked])


  const fetchData = async (e?: any) => {
    const selectedCategory = e?.target.value as string || '';
    const categoryFilter = selectedCategory === '' ? '' : 'categoryIds%5B0%5D=' + selectedCategory + '&';
    try {
        const categoriesResponse = await fetch('http://localhost:8080/categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.rows);
        const response = await fetch(`http://localhost:8080/courses?${categoryFilter}sort.order=${order}&sort.by=PRICE`);
        const jsonData = await response.json();
        setData(jsonData.rows);
    } catch (error) {
        console.error(error);
    }
  };

  const details = (id: string) => {
    navigate(`/courses/${id}`);
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, refresh, checked]);


  return (
    <>
        <Container>
        <h1 className="my-5">Lista Kursów</h1>
        {auth.isAdmin && (<Button type="button" className="btn-lg btn btn-success" onClick={() => navigate('/courses-create')}>
            Dodaj nowy kurs
        </Button>)}
        <Form>
            <Row className="bg-white p-5 my-5 rounded">
                <h2>Sortowanie i filtrowanie</h2><br /><br /><br />
                <Form.Group as={Col} xs="12" className="mb-3">
                    <ToggleButton
                        id="toggle-check"
                        type="checkbox"
                        variant="secondary"
                        checked={checked}
                        value="1"
                        onChange={(e) => setChecked(e.currentTarget.checked)}
                        >
                        Sortuj po cenie {checked ? 'DESC' : 'ASC'}
                    </ToggleButton>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicDifficulty" as={Col} xs="6">
                    <Form.Label>Kategoria</Form.Label>
                    <Form.Select name="category" onChange={(e) => fetchData(e)}>
                        <option value="" selected></option>
                        {categories?.map((category) => {
                            return <option value={category.id}>{category.name}</option>
                        })}
                    </Form.Select>
                </Form.Group>
            </Row>
        </Form>
        {data.map((row) => {
            return (
                <>
                    <hr />
                    <Row key={row.id}>
                        <Col xs={6}>
                            <h2><b>{row.name}</b></h2>
                            Cena: {row.price} zł<br />
                            Nauczyciel: {row.teacher.username}<br /><br />
                            <Button type="button" className="btn-lg btn btn-primary" onClick={() => details(row?.id)}>
                                Szczegóły
                            </Button>
                        </Col>
                        <Col xs={6}>
                            <ul>
                            {row.categories.map((category, index) => {
                                return (
                                    <>
                                            <li>{category.name}</li>
                                    </>
                                )
                            })}
                            </ul>
                        </Col>
                    </Row>
                </>
            )
        })}
            <br/>
        </Container>
    </>
  )
}

export default CoursesPage;
