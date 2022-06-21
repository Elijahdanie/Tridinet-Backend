import { Column, DataType, HasMany, IsEmail, IsUUID, Model, NotNull, PrimaryKey, Table, Unique } from "sequelize-typescript";
import Items from "./items";
import Worlds from "./worlds";

@Table({timestamps:true})
export default class Users extends Model<Users> {
    
    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    @Column
    name: string;

    @Unique
    @IsEmail
    @Column
    email: string;

    @Column(DataType.JSON)
    purchasedItems: string[]

    @Column
    password: string;

    @Column
    accountId: string;

    @HasMany(()=>Worlds)
    worlds: Worlds[];

    @HasMany(()=>Items)
    items: Items[];
}
