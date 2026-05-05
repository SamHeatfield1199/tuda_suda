import styles from "./MobileList.module.css";

// Компонент для отображения списка мест и людей на мобильных устройствах
export default function MobileList({ places, people }) {
  return (
    <div className={styles.container}>
      {places.map((place) => {
        const goingPeople = people.filter((p) => place.people.includes(p.id));

        return (
          <div key={place.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{place.name}</h3>

            {goingPeople.length ? (
              <ul className={styles.list}>
                {goingPeople.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyMessage}>Пока никто не идёт</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
