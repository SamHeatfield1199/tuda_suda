"use client";
import Header from "@/components/Header";
import {Flex, Layout, Typography } from "antd";
import styles from "./go_vmeste.module.css";
const { Title } = Typography;
import { useState } from "react";
import AppButton from "@/components/Button";
import Image from "next/image";

// Тип для места
interface Place {
  id: string;
  label: string;
}


const PLACES: Place[] = [
  { id: "1", label: "Музей" },
  { id: "2", label: "Кафе" },
  { id: "3", label: "Ресторан" },
];

// Страница с формой для выбора мест
export default function Form() {

  //TODO: Добавить useMemo когда начнем получать списки
  const [checked, setChecked] = useState<Record<string, boolean>>(
    PLACES.reduce((acc, place) => ({ ...acc, [place.id]: false }), {}),
  );

  // Функция для переключения состояния выбранного места
  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

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
        <div className={styles.placesContainer}>
          <div className={styles.placesTitleRow}>
            <Title level={3} className={styles.placesTitle}>
              Места
            </Title>
            <Image src={"/star.png"} alt={"star"} width={30} height={30} />
          </div>

          <div className={styles.placesCard}>
            {PLACES.map((place) => (
              <div key={place.id} className={styles.placesItem}>
                <span className={styles.placesLabel}>{place.label}</span>
                <button
                  onClick={() => toggle(place.id)}
                  className={styles.placesCheckbox}
                >
                  {checked[place.id] && (
                    <Image
                      src="/check.png"
                      alt="checked"
                      width={20}
                      height={20}
                      style={{ marginLeft: "20px", marginBottom: "10px" }}
                    />
                  )}
                </button>
              </div>
            ))}
          </div>

          <AppButton
            size="large"
            title={"Поехали!"}
            color={"grass"}
          ></AppButton>
        </div>
      </Flex>
    </Layout>
  );
}
