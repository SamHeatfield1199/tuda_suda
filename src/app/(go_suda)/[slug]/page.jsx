"use client";
import { useState } from "react";
import styles from "./go_suda.module.css";
import { Alert, Button, Layout, Flex, Table } from "antd";
import Header from "@/components/Header";
import MobileList from "@/components/MobileList/MobileList";
import tableData from "@/mocks/go_suda_table.json";
import useIsMobile from "@/hooks/useIsMobile";
import AppButton from "@/components/Button";

const { people, places } = tableData;

// Генерация колонок для таблицы
const columns = [
  {
    title: "",
    dataIndex: "place",
    key: "place",
  },

  ...people.map((person) => ({
    title: person.name,
    dataIndex: person.id,
    key: person.id,
    align: "center",
  })),
];

// Генерация данных для таблицы
const dataSource = places.map((place) => {
  const row = {
    key: place.id,
    place: place.name,
  };

  people.forEach((person) => {
    row[person.id] = place.people.includes(person.id) ? "Идёт" : "";
  });

  return row;
});

// Главный компонент страницы "Го сюда"
export default function GoSuda() {
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const isMobile = useIsMobile();

  // Функция для копирования ссылки в буфер обмена
  const handleCopy = async () => {
    const id = window.location.pathname.replace("/", "");
    const link = `${window.location.origin}/form/${id}`;

    try {
      await navigator.clipboard.writeText(link);
      setStatus("success"); // усп
    } catch (err) {
      console.error("Ошибка копирования", err);
      setStatus("error"); // ошибка
    }
  };

  return (
      <Layout style={{ width: "100%", minHeight: "100vh" }}>
        <Header title="Го сюда" />
        <Flex className={styles.flexContainer} gap="middle" align="flex-start" justify="center" vertical>
          {isMobile ? (
            <MobileList places={places} people={people} />
          ) : (
              <Table
                className={styles.table}
                columns={columns}
                dataSource={dataSource}
                bordered
                pagination={false}
              />
          )}

          <AppButton size="large" title={' Отправить любимкам'} color={'lilac'} onClick={handleCopy}></AppButton>

          {status === "success" && (
            <Alert
              title="Скопировано!"
              description="Ссылка успешно скопирована в буфер обмена."
              type="success"
              showIcon
            />
          )}

          {status === "error" && (
            <Alert
              title="Ошибка"
              description="Не удалось скопировать ссылку. Попробуйте снова."
              type="error"
              showIcon
            />
          )}
        </Flex>
      </Layout>
  );
}
