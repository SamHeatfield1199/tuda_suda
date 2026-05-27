'use client';

import styles from './page.module.css';
import Header from '@/components/Header';
import AppButton from '@/components/Button';
import React, { useState } from 'react';
import Toast from '@/components/Toast';
import { checkDuplicate } from '@/utils/duplicates';
import InteractiveList from '@/components/InteractiveList/InteractiveList';
import { MapPickedPlace, MapPickerButton } from '@/components/MapPickerButton';
import { useRouter } from 'next/navigation';

// Тип для элемента списка людей или мест
interface ListItem {
  name: string;
  id: string;
  link?: string | null;
}

// Главная страница для создания опроса
export default function Home() {
  const router = useRouter();

  const [persons, setPersons] = useState<ListItem[]>([]);
  const [places, setPlaces] = useState<ListItem[]>([]);

  const [personInputName, setPersonName] = useState('');
  const [placeInputName, setPlaceName] = useState('');

  const [personInputError, setPersonInputError] = useState('');
  const [placeInputError, setPlaceInputError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Функция для добавления человека в список
  function addPerson() {
    const name = personInputName.trim();

    if (!name) {
      return;
    }

    if (checkDuplicate(name, persons, 'name')) {
      setPersonInputError('Такое имя уже есть в списке');

      return;
    }

    setPersons([...persons, { id: crypto.randomUUID(), name }]);
    setPersonName('');
  }

  // Функция для удаления человека из списка
  function removePerson(id: string) {
    setPersons(persons.filter((person) => person.id !== id));
  }

  // Функция для добавления места в список
  function addPlace() {
    const newPlace = placeInputName.trim();

    if (!newPlace) {
      return;
    }

    if (checkDuplicate(newPlace, places, 'name')) {
      setPlaceInputError('Такое место уже есть в списке');

      return;
    }

    setPlaces([...places, { id: crypto.randomUUID(), name: newPlace, link: null }]);
    setPlaceName('');
  }

  // Функция для добавления места из карты
  function addPlaceFromMap(place: MapPickedPlace) {
    const name = place.name.trim();

    if (!name) {
      return;
    }

    if (checkDuplicate(name, places, 'name')) {
      setPlaceInputError('Такое место уже есть в списке');

      return;
    }

    setPlaces([...places, { id: crypto.randomUUID(), name, link: place.link }]);
    setPlaceName('');
    setPlaceInputError('');
  }

  // Функция для удаления места из списка
  function removePlace(id: string) {
    setPlaces(places.filter((place) => place.id !== id));
  }

  // Функция для валидации формы перед отправкой
  function validateForm(persons: ListItem[], places: ListItem[]): boolean {
    if (persons.length === 0) {
      Toast.show({ type: 'error', message: 'Добавьте хотя бы одного человека.' });
      return false;
    }
    if (places.length === 0) {
      Toast.show({ type: 'error', message: 'Добавьте хотя бы одно место.' });
      return false;
    }

    return true;
  }

  // Функция для создания формы опроса
  function createForm() {
    if (!validateForm(persons, places)) {
      return;
    }

    setIsSubmitting(true);
    fetch('/api/survey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        people: persons.map((person) => person.name),
        places: places.map((place) => ({
          name: place.name,
          link: place.link ?? null,
        })),
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          Toast.show({ type: 'error', message: 'Ошибка при создании формы.' });
          return;
        }
        Toast.show({ type: 'success', message: 'Форма успешно создана!' });

        await response.json().then((data) => {
          router.push(`/${data.slug}`);
        });
      })
      .catch(() => {
        Toast.show({ type: 'error', message: 'Произошла ошибка при отправке данных.' });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <>
      <Header title={'Го туда'} />
      <div className={styles.page}>
        <main className={styles.main}>
          <InteractiveList
            title='Любимки'
            icon='/heart.png'
            iconAlt='Иконка сердца'
            items={persons}
            inputValue={personInputName}
            onInputChange={(value) => {
              setPersonName(value);
              setPersonInputError('');
            }}
            onAdd={addPerson}
            onRemove={removePerson}
            inputError={personInputError}
            placeholder='Имя'
          />

          <InteractiveList
            title='Места'
            icon='/star.png'
            iconAlt='Иконка звезды'
            items={places}
            inputValue={placeInputName}
            onInputChange={(value) => {
              setPlaceName(value);
              setPlaceInputError('');
            }}
            onAdd={addPlace}
            onRemove={removePlace}
            inputError={placeInputError}
            placeholder='Название'
            extraButton={<MapPickerButton onPick={addPlaceFromMap} />}
          />
          <AppButton
            size='large'
            title={'Поехали'}
            color={'grass'}
            disabled={isSubmitting}
            onClick={createForm}
          ></AppButton>
        </main>
      </div>
    </>
  );
}
