'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import styles from './go_suda.module.css';
import { Alert, Flex, Layout, Table } from 'antd';
import Header from '@/components/Header';
import MobileList from '@/components/MobileList/MobileList';
import useIsMobile from '@/hooks/useIsMobile';
import AppButton from '@/components/Button';
import { useParams, useRouter } from 'next/navigation';
import Toast from '../../../components/Toast';

// Столбец для названия места
const placeColumn = {
  title: '',
  dataIndex: 'placeName',
  key: 'place',
  render: (placeName, row) =>
    row.placeLink ? (
      <a href={row.placeLink} target='_blank' rel='noopener noreferrer'>
        {placeName}
      </a>
    ) : (
      placeName
    ),
};

// Страница для отображения результатов опроса
export default function GoSuda() {
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [columns, setColumns] = useState([placeColumn]);
  const [dataSource, setDataSource] = useState([]);
  const [people, setPeople] = useState([]);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  const { slug } = useParams();
  const router = useRouter();

  // Функция для загрузки данных опроса
  const loadSurvey = useEffectEvent(async (surveySlug, signal) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/survey/${surveySlug}`, { signal });
      if (!response.ok) {
        Toast.show({ type: 'error', message: 'Опрос не найден.' });
        router.push('/');
        // todo: 404
      }

      const data = await response.json();
      const receivedPeople = data.people ?? [];
      const receivedPlaces = data.places ?? [];

      setPeople(receivedPeople);
      setPlaces(receivedPlaces);
      setColumns([
        placeColumn,
        ...receivedPeople.map((person) => ({
          title: person.name,
          dataIndex: person.id,
          key: person.id,
          align: 'center',
        })),
      ]);

      setDataSource(
        receivedPlaces.map((place) => {
          const row = {
            key: place.id,
            placeName: place.name,
            placeLink: place.link,
          };

          receivedPeople.forEach((person) => {
            row[person.id] = place.people?.includes(person.id) ? 'Идёт' : '';
          });

          return row;
        }),
      );
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Ошибка запроса результатов опроса: ', error);
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    if (!slug) {
      return;
    }

    const abortController = new AbortController();
    loadSurvey(slug, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [slug]);

  // Функция для копирования ссылки на опрос
  const handleCopy = async () => {
    const id = window.location.pathname.replace('/', '');
    const link = `${window.location.origin}/form/${id}`;

    try {
      await navigator.clipboard.writeText(link);

      setStatus('success');
    } catch (err) {
      console.error('Ошибка копирования', err);
      setStatus('error');
    }
  };

  // Функция для удаления опроса
  const handleDelete = async () => {
    const response = await fetch(`/api/survey/${slug}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      Toast.show({ type: 'error', message: 'Не удалось удалить опрос.' });
      return;
    }
    Toast.show({ type: 'success', message: 'Опрос удален успешно!' });
    router.push('/');
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
        {isMobile ? (
          <MobileList places={places} people={people} />
        ) : (
          <Table
            className={styles.table}
            columns={columns}
            dataSource={dataSource}
            loading={isLoading}
            bordered
            pagination={false}
          />
        )}

        <AppButton size='large' title='Отправить любимкам' color='lilac' onClick={handleCopy} />
        <AppButton size='large' title='Удалить' color='red' onClick={handleDelete} />

        {status === 'success' && (
          <Alert
            title='Скопировано!'
            description='Ссылка успешно скопирована в буфер обмена.'
            type='success'
            showIcon
          />
        )}

        {status === 'error' && (
          <Alert
            title='Ошибка'
            description='Не удалось скопировать ссылку. Попробуйте снова.'
            type='error'
            showIcon
          />
        )}
      </Flex>
    </Layout>
  );
}
