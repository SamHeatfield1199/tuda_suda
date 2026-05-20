"use client";

import { useEffect, useEffectEvent, useState } from "react";
import styles from "./go_suda.module.css";
import { Alert, Flex, Layout, Table } from "antd";
import Header from "@/components/Header";
import MobileList from "@/components/MobileList/MobileList";
import useIsMobile from "@/hooks/useIsMobile";
import AppButton from "@/components/Button";
import { useParams } from "next/navigation";

// Столбец для названия места
const placeColumn = {
  title: "",
  dataIndex: "placeName",
  key: "place",
  render: (placeName, row) =>
    row.placeLink ? (
      <a href={row.placeLink} target="_blank" rel="noopener noreferrer">
        {placeName}
      </a>
    ) : (
      placeName
    ),
};

export default function GoSuda() {
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [columns, setColumns] = useState([placeColumn]);
  const [dataSource, setDataSource] = useState([]);
  const [people, setPeople] = useState([]);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  const { slug } = useParams();

  // Функция для загрузки данных опроса
  const loadSurvey = useEffectEvent(async (surveySlug, signal) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/survey/${surveySlug}`, { signal });
      if (!response.ok) {
        throw new Error(`Ошибка получения данных опроса`);
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
          align: "center",
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
            row[person.id] = place.people?.includes(person.id) ? "Идёт" : "";
          });

          return row;
        }),
      );
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Ошибка запроса результатов опроса: ", error);
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
    const id = window.location.pathname.replace("/", "");
    const link = `${window.location.origin}/form/${id}`;

    try {
      await navigator.clipboard.writeText(link);
      setStatus("success");
    } catch (err) {
      console.error("Ошибка копирования", err);
      setStatus("error");
    }
  };

  return (
    <Layout style={{ width: "100%", minHeight: "100vh" }}>
      <Header title="Го сюда" />

      <Flex
        className={styles.flexContainer}
        gap="middle"
        align="flex-start"
        justify="center"
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

        <AppButton
          size="large"
          title="Отправить любимкам"
          color="lilac"
          onClick={handleCopy}
        />

        {status === "success" && (
          <Alert
            message="Скопировано!"
            description="Ссылка успешно скопирована в буфер обмена."
            type="success"
            showIcon
          />
        )}

        {status === "error" && (
          <Alert
            message="Ошибка"
            description="Не удалось скопировать ссылку. Попробуйте снова."
            type="error"
            showIcon
          />
        )}
      </Flex>
    </Layout>
  );
}
