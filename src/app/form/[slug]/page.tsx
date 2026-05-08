"use client";

import Header from "@/components/Header";
import AppButton from "@/components/Button";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Alert, Flex, Layout, Typography } from "antd";
import styles from "./go_vmeste.module.css";

const { Title } = Typography;

interface Place {
  id: string;
  label: string;
}

interface Person {
  id: string;
  label: string;
}

type SubmitStatus = "success" | "error" | null;

// td: заменить на данные полученные из БД
const PLACES: Place[] = [
  { id: "1", label: "Музей" },
  { id: "2", label: "Кафе" },
  { id: "3", label: "Ресторан" },
];

const PEOPLE: Person[] = [
  { id: "1", label: "Анжела" },
  { id: "2", label: "Оля" },
];

export default function Form() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    PLACES.reduce((acc, place) => ({ ...acc, [place.id]: false }), {}),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null);
  const [submitError, setSubmitError] = useState("");

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSubmit = async () => {
    const selectedPlaces = PLACES.filter((place) => checked[place.id]).map(
      (place) => ({
        id: place.id,
        name: place.label,
      }),
    );

    if (!slug) {
      setSubmitStatus("error");
      setSubmitError("Не удалось определить форму для отправки.");
      return;
    }

    if (selectedPlaces.length === 0) {
      setSubmitStatus("error");
      setSubmitError("Выберите хотя бы одно место.");
      return;
    }

    if (!selectedPersonId) {
      setSubmitStatus("error");
      setSubmitError("Выберите, кто вы.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      setSubmitError("");

      const response = await fetch(`/api/survey/${slug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

        throw new Error(errorBody?.error ?? "Не удалось отправить форму.");
      }

      setSubmitStatus("success");
    } catch (error) {
      setSubmitStatus("error");
      setSubmitError(
        error instanceof Error ? error.message : "Не удалось отправить форму.",
      );
    } finally {
      setIsSubmitting(false);
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
        <Flex
          gap="large"
          align="flex-start"
          justify="center"
        >
          <div className={styles.placesContainer}>
            <div className={styles.placesTitleRow}>
              <Title level={3} className={styles.placesTitle}>
                Места
              </Title>
              <Image src="/star.png" alt="star" width={30} height={30} />
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
          </div>

          <div className={styles.placesContainer}>
            <div className={styles.placesTitleRow}>
              <Title level={3} className={styles.placesTitle}>
                Кто я
              </Title>
              <Image src="/heart.png" alt="heart" width={30} height={30} />
            </div>

            <div className={styles.peopleCard}>
              {PEOPLE.map((person) => {
                const isSelected = selectedPersonId === person.id;

                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setSelectedPersonId(person.id)}
                    className={styles.peopleItem}
                  >
                    <span className={styles.placesLabel}>{person.label}</span>
                    <span
                      className={`${styles.personToggle} ${isSelected ? styles.personToggleActive : ""}`}
                      aria-hidden="true"
                    >
                      <span className={styles.personToggleThumb} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Flex>
        <AppButton
          size="large"
          title={isSubmitting ? "Готовимся к поездке..." : "Поехали!"}
          color="grass"
          onClick={handleSubmit}
        />

        {submitStatus === "success" && (
          <Alert
            title="Ответ отправлен"
            description="Ваш выбор сохранился. Можно закрывать страницу."
            type="success"
            showIcon
          />
        )}

        {submitStatus === "error" && (
          <Alert
            title="Ошибка отправки"
            description={submitError}
            type="error"
            showIcon
          />
        )}
      </Flex>
    </Layout>
  );
}
