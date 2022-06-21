import { Column, ForeignKey, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import Transactions from "./transactions";
import Users from "./users";


@Table({timestamps:true})
export default class Account extends Model<Account> {

    @PrimaryKey
    @Column
    id: string;

    @ForeignKey(()=>Users)
    @Column
    userId: string

    @Column
    oxygen: number;

    @HasMany(()=>Transactions)
    transactions: Transactions[];
}
