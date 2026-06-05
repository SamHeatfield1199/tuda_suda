'use client';

import { useMemo, useState } from 'react';
import { Alert, Flex, Layout, Table } from 'antd';
import type { TableProps } from 'antd';
import { useRouter } from 'next/navigation';
import AppButton from '@/components/Button';
import Header from '@/components/Header';
import MobileList from '@/components/MobileList/MobileList';
import Toast from '@/components/Toast';
import useIsMobile from '@/hooks/useIsMobile';
import type { FormPerson, FormPlace } from '@/server/survey/types';
import styles from './go_suda.module.css';

type ResultsClientProps = {
  slug: string;
  places: FormPlace[];
  people: FormPerson[];
};

type ResultsRow = {
  key: string;
  placeName: string;
  placeLink: string | null;
  [personId: string]: string | null;
};

// Колонки для таблицы результатов, включая рендеринг ссылок на места
const placeColumn: TableProps<ResultsRow>['columns'] = [
  {
    title: '',
    dataIndex: 'placeName',
    key: 'place',
    render: (placeName: string, row) =>
      row.placeLink ? (
        <a href={row.placeLink} target='_blank' rel='noopener noreferrer'>
          {placeName}
        </a>
      ) : (
        placeName
      ),
  },
];

// Компонент для отображения результатов опроса
export default function ResultsClient({ slug, places, people }: ResultsClientProps) {
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const router = useRouter();
  const isMobile = useIsMobile();

  const columns = useMemo<TableProps<ResultsRow>['columns']>(
    () => [
      ...(placeColumn ?? []),
      ...people.map((person) => ({
        title: person.name,
        dataIndex: person.id,
        key: person.id,
        align: 'center' as const,
      })),
    ],
    [people],
  );

  const dataSource = useMemo(
    () =>
      places.map((place) => {
        const row: ResultsRow = {
          key: place.id,
          placeName: place.name,
          placeLink: place.link,
        };

        people.forEach((person) => {
          row[person.id] = place.people?.includes(person.id) ? 'Идёт' : '';
        });

        return row;
      }),
    [people, places],
  );

  // Функция для копирования ссылки на форму опроса в буфер обмена
  const handleCopy = async () => {
    const link = `${window.location.origin}/form/${slug}`;

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
          <MobileList
            places={places.map((place) => ({ ...place, people: place.people ?? [] }))}
            people={people}
          />
        ) : (
          <Table
            className={styles.table}
            columns={columns}
            dataSource={dataSource}
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
