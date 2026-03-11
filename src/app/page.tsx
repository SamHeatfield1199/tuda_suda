'use client';

import styles from "./page.module.css";
import Header from "@/components/Header";
import Image from "next/image";
import AppButton from "@/components/Button";
import {Form, Input, Space} from "antd";
import React, {useState} from "react";
import {checkDuplicate} from "@/utils/duplicates";

interface ListItem {
    name: string;
    id: string
}

export default function Home() {
    const [persons, setPersons] = useState<ListItem[]>([]);
    const [places, setPlaces] = useState<ListItem[]>([]);

    const [personInputName, setPersonName] = useState('');
    const [placeInputName, setPlaceName] = useState('');

    const [personInputError, setPersonInputError] = useState('');
    const [placeInputError, setPlaceInputError] = useState('');

    function addPerson() {
        setPersonInputError('');
        const name = personInputName.trim();

        if (!name) {
            return;
        }

        if (checkDuplicate(name, persons, 'name')) {
            setPersonInputError('Такое имя уже есть в списке');

            return;
        }

        setPersons([
            ...persons,
            { id: crypto.randomUUID(), name },
        ]);
        setPersonName('');
    }

    function removePerson(id: string) {
        setPersons(persons.filter((person) => person.id !== id));
    }

    function addPlace() {
        setPlaceInputError('');
        const newPlace = placeInputName.trim();

        if (!newPlace) {
            return;
        }

        if (checkDuplicate(newPlace, places, 'name')) {
            setPlaceInputError('Такое место уже есть в списке');

            return;
        }

        setPlaces([
            ...places,
            { id: crypto.randomUUID(), name: newPlace },
        ]);
        setPlaceName('');
    }

    function removePlace(id: string) {
        setPlaces(places.filter((place) => place.id !== id));
    }

    return (
        <>
            <Header title={'Го туда'}/>
            <div className={styles.page}>
                <main className={styles.main}>
                    <Space vertical style={{ minHeight: '300px' }}>
                        <Space>
                            <h2 style={{ margin: 0 }}>
                                Любимки
                            </h2>
                            <Image src={'/heart.png'} alt={''} width={30} height={30}/>
                        </Space>
                        <Space style={{gap: 24, marginTop: 10}} align={'start'}>
                            <Form.Item
                                validateStatus={personInputError ? 'error' : ''}
                                help={personInputError}
                            >
                                <Input
                                    value={personInputName}
                                    onChange={e => setPersonName(e.target.value)}
                                    onPressEnter={addPerson}
                                    placeholder={'Имя'}
                                />
                            </Form.Item>
                            <AppButton title={'Добавить'} color={'lilac'} onClick={addPerson}></AppButton>
                        </Space>
                        <ul style={{ marginInlineStart: 20 }}>
                            {persons.map((person) =>
                                <li key={person.id} style={{paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 12}}>
                                    <span>{person.name}</span>
                                    <CloseCircleOutlined onClick={() => removePerson(person.id)} />
                                </li>
                            )}
                        </ul>
                    </Space>
                    <Space vertical style={{ minHeight: '300px' }}>
                        <Space>
                            <h2 style={{ margin: 0 }}>
                                Места
                            </h2>
                            <Image src={'/star.png'} alt={''} width={30} height={30}/>
                        </Space>
                        <Space style={{gap: 24, marginTop: 10}} align={'start'}>
                            <Form.Item
                                validateStatus={placeInputError ? 'error' : ''}
                                help={placeInputError}
                            >
                                <Input
                                    value={placeInputName}
                                    onChange={e => setPlaceName(e.target.value)}
                                    onPressEnter={addPlace}
                                    placeholder={'Название'}
                                />
                            </Form.Item>
                            <AppButton title={'Добавить'} color={'lilac'} onClick={addPlace}></AppButton>
                        </Space>
                        <ul style={{ marginInlineStart: 20 }}>
                            {places.map((place) =>
                                <li key={place.id} style={{paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 12}}>
                                    <span>{place.name}</span>
                                    <CloseCircleOutlined onClick={() => removePlace(place.id)} />
                                </li>
                            )}
                        </ul>
                    </Space>
                    <AppButton size="large" title={'Поехали'} color={'grass'}></AppButton>
                </main>
            </div>
        </>
    );
}
