import { Table, Column, PrimaryKey, ForeignKey, Model } from "sequelize-typescript";
import Account from "./account";
import Items from "./Repository";

@Table({timestamps:true})
export default class Transactions extends Model<Transactions> {
    @PrimaryKey
    @Column
    id: string;

    @ForeignKey(()=>Account)
    @Column
    accountId: string;

    @ForeignKey(()=>Items)
    @Column
    itemId: string;

    @Column
    cost: number;
}
