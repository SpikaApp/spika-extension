import { v4 as uuidv4 } from "uuid";
import { IContact } from "../interface";
import { PLATFORM } from "../utils/constants";
import { getStore, setStore } from "./store";

const _contacts = "contacts";

export const initContacts = async (): Promise<void> => {
  const contacts: Array<IContact> = await getStore(PLATFORM, _contacts);
  if (!contacts) {
    const data: Array<IContact> = [];
    setStore(PLATFORM, _contacts, data);
  }
};

export const getContacts = async (): Promise<Array<IContact>> => {
  return await getStore(PLATFORM, _contacts);
};

export const addContact = async (name: string, address: string, remarks: string): Promise<void> => {
  const contacts: Array<IContact> = await getStore(PLATFORM, _contacts);
  const contact: IContact = {
    id: uuidv4(),
    name: name,
    address: address,
    remarks: remarks,
  };
  contacts.push(contact);
  contacts.sort((a: IContact, b: IContact) => a.name.localeCompare(b.name));
  setStore(PLATFORM, _contacts, contact);
};

export const editContact = async (id: string, name: string, address: string, remarks: string): Promise<void> => {
  const contacts: Array<IContact> = await getStore(PLATFORM, _contacts);
  const contact: IContact = {
    id: id,
    name: name,
    address: address,
    remarks: remarks,
  };
  const result = contacts.filter((contact) => contact.id !== id);
  result.push(contact);
  result.sort((a: IContact, b: IContact) => a.name.localeCompare(b.name));
  setStore(PLATFORM, _contacts, result);
};

export const deleteContact = async (id: string): Promise<void> => {
  const contacts: Array<IContact> = await getStore(PLATFORM, _contacts);
  const result = contacts.filter((contact: IContact) => contact.id !== id);
  result.sort((a: IContact, b: IContact) => a.name.localeCompare(b.name));
  setStore(PLATFORM, _contacts, result);
};
