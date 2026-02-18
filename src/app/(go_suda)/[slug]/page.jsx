import styles from "./go_suda.module.css";
import { Table } from "antd";
import Header from "@/components/Header";
import tableData from "@/mocks/go_suda_table.json";

const { people, places } = tableData;
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

export default function GoSuda() {
  return (
    <>
      <Header title="Го сюда" />
      <div className={styles.page}>
        <Table
          classNames={styles.table}
          columns={columns}
          dataSource={dataSource}
          bordered
          pagination={false}
        />
      </div>
    </>
  );
}
