'use client';

import Header from '@/components/Header';
import AppButton from '@/components/Button';
import Image from 'next/image';
import { useState } from 'react';
import { Alert, Flex, Layout, Typography } from 'antd';
import styles from './go_vmeste.module.css';

const { Title } = Typography;

type Place = {
  id: string;
  name: string;
  link: string | null;
};

type Person = {
  id: string;
  name: string;
};

type SurveyClientProps = {
  slug: string;
  places: Place[];
  people: Person[];
};

type SubmitStatus = 'success' | 'error' | null;

// Компонент для отображения формы опроса
export default function SurveyClient({ slug, places, people }: SurveyClientProps) {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [submitError, setSubmitError] = useState('');

  // Функция для переключения состояния выбора места
  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  // Функция для обработки отправки формы
  const handleSubmit = async () => {
    // Получаем список выбранных мест
    const selectedPlaces = places
      .filter((place) => checked[place.id])
      .map((place) => ({
        id: place.id,
        name: place.name,
      }));

    if (selectedPlaces.length === 0) {
      setSubmitStatus('error');
      setSubmitError('Выберите хотя бы одно место.');

      return;
    }

    if (!selectedPersonId) {
      setSubmitStatus('error');
      setSubmitError('Выберите, кто вы.');

      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      setSubmitError('');

      const response = await fetch(`/api/survey/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedPersonId,
          places: selectedPlaces,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(errorBody?.error ?? 'Не удалось отправить форму.');
      }

      setSubmitStatus('success');
    } catch (error) {
      setSubmitStatus('error');
      setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить форму.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout style={{ width: '100%', minHeight: '100vh' }}>
      <Header title='Го сюда' />
      <Flex
        className={styles.flexContainer}
        gap='middle'
        align='flex-start'
        justify='center'
        vertical
      >
        <Flex gap='large' align='flex-start' justify='center'>
          <div className={styles.placesContainer}>
            <div className={styles.placesTitleRow}>
              <Title level={3} className={styles.placesTitle}>
                Места
              </Title>
              <Image src='/star.png' alt='star' width={30} height={30} />
            </div>

            <div className={styles.placesCard}>
              {places.map((place) => (
                <div key={place.id} className={styles.placesItem}>
                  <span className={styles.placesLabel}>{place.name}</span>
                  <button
                    type='button'
                    onClick={() => toggle(place.id)}
                    className={styles.placesCheckbox}
                    aria-label={`Выбрать место ${place.name}`}
                  >
                    {checked[place.id] && (
                      <Image
                        src='/check.png'
                        alt='checked'
                        width={20}
                        height={20}
                        style={{ marginLeft: '20px', marginBottom: '10px' }}
                      />
                    )}
                  </button>
                </div>
              ))}
              {places.length === 0 && <span className={styles.placesLabel}>Список мест пуст</span>}
            </div>
          </div>

          <div className={styles.placesContainer}>
            <div className={styles.placesTitleRow}>
              <Title level={3} className={styles.placesTitle}>
                Кто я
              </Title>
              <Image src='/heart.png' alt='heart' width={30} height={30} />
            </div>

            <div className={styles.peopleCard}>
              {people.map((person) => {
                const isSelected = selectedPersonId === person.id;

                return (
                  <button
                    key={person.id}
                    type='button'
                    onClick={() => setSelectedPersonId(person.id)}
                    className={styles.peopleItem}
                  >
                    <span className={styles.placesLabel}>{person.name}</span>
                    <span
                      className={`${styles.personToggle} ${
                        isSelected ? styles.personToggleActive : ''
                      }`}
                      aria-hidden='true'
                    >
                      <span className={styles.personToggleThumb} />
                    </span>
                  </button>
                );
              })}
              {people.length === 0 && <span className={styles.placesLabel}>Список людей пуст</span>}
            </div>
          </div>
        </Flex>

        <AppButton
          size='large'
          title={isSubmitting ? 'Готовимся к поездке...' : 'Поехали!'}
          disabled={isSubmitting}
          color='grass'
          onClick={handleSubmit}
        />

        {submitStatus === 'success' && (
          <Alert
            title='Ответ отправлен'
            description='Ваш выбор сохранился. Можно закрывать страницу.'
            type='success'
            showIcon
          />
        )}

        {submitStatus === 'error' && (
          <Alert title='Ошибка отправки' description={submitError} type='error' showIcon />
        )}
      </Flex>
    </Layout>
  );
}
