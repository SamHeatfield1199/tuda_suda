'use client';

import styles from "./page.module.css";
import Header from "@/components/Header";
import AppButton from "@/components/Button";
import React, {useState} from "react";
import Toast from "@/components/Toast";
import {checkDuplicate} from "@/utils/duplicates";
import InteractiveList from "@/components/InteractiveList/InteractiveList";
import { MapPickerButton } from "@/components/MapPickerButton";

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

    function validateForm(persons: ListItem[], places: ListItem[]): boolean {
        if (persons.length === 0) {
            Toast.show({type: 'error', message: 'Добавьте хотя бы одного человека.'});
            return false;
        }
        if (places.length === 0) {
            Toast.show({type: 'error', message: 'Добавьте хотя бы одно место.'});
            return false;
        }

        return true;
    }

    function createForm() {
        if (!validateForm(persons, places)) {
            return;
        }
        fetch('/api/forms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                people: persons.map((person) => person.name),
                places: places.map((place) => place.name),
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    Toast.show({type: 'error', message: 'Ошибка при создании формы.'});
                    return;
                }
                Toast.show({type: 'success', message: 'Форма успешно создана!'});
            })
            .catch(() => {
                Toast.show({type: 'error', message: 'Произошла ошибка при отправке данных.'});
            });
    }

    return (
        <>
            <Header title={'Го туда'}/>
            <div className={styles.page}>
                <main className={styles.main}>
                    <InteractiveList
                        title="Любимки"
                        icon="/heart.png"
                        iconAlt="Иконка сердца"
                        items={persons}
                        inputValue={personInputName}
                        onInputChange={(value) => {
                            setPersonName(value);
                            setPersonInputError('');
                        }}
                        onAdd={addPerson}
                        onRemove={removePerson}
                        inputError={personInputError}
                        placeholder="Имя"
                    />

                    <InteractiveList
                        title="Места"
                        icon="/star.png"
                        iconAlt="Иконка звезды"
                        items={places}
                        inputValue={placeInputName}
                        onInputChange={(value) => {
                            setPlaceName(value);
                            setPlaceInputError('');
                        }}
                        onAdd={addPlace}
                        onRemove={removePlace}
                        inputError={placeInputError}
                        placeholder="Название"
                        extraButton={<MapPickerButton />}
                    />
                    <AppButton size="large" title={'Поехали'} color={'grass'} onClick={createForm}></AppButton>
                </main>
            </div>
        </>
    );
}