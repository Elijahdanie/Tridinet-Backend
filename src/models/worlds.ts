import { Column, DataType, ForeignKey, IsUUID, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";
import { worldType } from "../props/templates";
import Users from "./users";

@Table({timestamps:true})
export default class Worlds extends Model<Worlds> {

    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    @Unique
    @Column
    name: string;

    @Column(DataType.JSON)
    data: JSON;

    @Column
    access: string;

    @Column
    privateKey: string;

    @Column
    url: string;

    @Column(DataType.JSON)
    type: string;

    @ForeignKey(()=>Users)
    @Column
    userId: string;

}
