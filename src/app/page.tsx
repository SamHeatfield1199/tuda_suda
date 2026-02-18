'use client';

import styles from "./page.module.css";
import Header from "@/components/Header";
import Image from "next/image";
import AppButton from "@/components/Button";
import {Input, Space} from "antd";
import React, {useState} from "react";
import {CloseCircleOutlined} from "@ant-design/icons";

export default function Home() {
    const [persons, setPersons] = useState<string[]>([]);

    const [personInputName, setPersonName] = useState('');

    function addPerson() {
        const name = personInputName.trim();

        if (!name) {
            return;
        }

        setPersons([
            ...persons,
            name,
        ]);
        setPersonName('');
    }

    function removePerson(index: number) {
        setPersons(persons.filter((name, i) =>  i !== index));
    }

    return (
        <>
            <Header title={'Го туда'}/>
            <div className={styles.page}>
                <main className={styles.main}>
                    <Space vertical>
                        <Space>
                            <h2 style={{ margin: 0 }}>
                                Любимки
                            </h2>
                            <Image src={'/heart.png'} alt={''} width={30} height={30}/>
                        </Space>
                        <Space style={{gap: 24, marginTop: 10}}>
                            <Input value={personInputName} onChange={e => setPersonName(e.target.value)} placeholder={'Имя'} />
                            <AppButton title={'Добавить'} color={'lilac'} onClick={addPerson}></AppButton>
                        </Space>
                        <ul style={{ marginInlineStart: 20, marginTop: 20 }}>
                            {persons.map((person, index) =>
                                <li key={index} style={{paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 12}}>
                                    <span>{person}</span>
                                    <CloseCircleOutlined onClick={() => removePerson(index)} />
                                </li>
                            )}
                        </ul>
                    </Space>
                    <AppButton size="large" title={'Поехали'} color={'grass'}></AppButton>
                </main>
            </div>
        </>
    );
}
