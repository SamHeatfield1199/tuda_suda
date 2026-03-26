'use client';

import styles from "./page.module.css";
import Header from "@/components/Header";
import AppButton from "@/components/Button";
import React, {useState} from "react";
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
                    <AppButton size="large" title={'Поехали'} color={'grass'}></AppButton>
                </main>
            </div>
        </>
    );
}
