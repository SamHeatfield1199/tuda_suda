import {Form, Input, Space} from "antd";
import Image from "next/image";
import {CloseCircleOutlined} from "@ant-design/icons";
import AppButton from "../Button";
import styles from "./InteractiveList.module.css";

interface ListItem {
    name: string;
    id: string;
}

interface ListSectionProps {
    title: string;
    icon: string;
    iconAlt: string;
    items: ListItem[];
    inputValue: string;
    onInputChange: (value: string) => void;
    onAdd: () => void;
    onRemove: (id: string) => void;
    inputError: string;
    placeholder: string;
    extraButton?: React.ReactNode;
}

export default function InteractiveList({
    title,
    icon,
    iconAlt,
    items,
    inputValue,
    onInputChange,
    onAdd,
    onRemove,
    inputError,
    placeholder,
    extraButton
}: ListSectionProps) {
    return (
        <Space
            vertical
            className={styles.block}
        >
            <Space>
                <h2>{title}</h2>
                <Image
                    src={icon}
                    alt={iconAlt}
                    width={30}
                    height={30}
                />
            </Space>
            <Space
                className={styles.inputGroup}
                align="start">
                <Form.Item
                    validateStatus={inputError ? 'error' : ''}
                    help={inputError}
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        onPressEnter={onAdd}
                        placeholder={placeholder}
                    />
                </Form.Item>
                <AppButton
                    title="Добавить"
                    color="lilac"
                    onClick={onAdd}
                />
                {extraButton}
            </Space>
            <ul className={styles.list}>{
                items.map((item) => (
                    <li key={item.id} className={styles.listItem}>
                        <span>{item.name} </span>
                        <CloseCircleOutlined onClick={() => onRemove(item.id)}/>
                    </li>
                ))
            }</ul>
        </Space>
    );
}
