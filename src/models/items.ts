import { Column, ForeignKey, IsUUID, Model, PrimaryKey, Table } from "sequelize-typescript";
import Users from "./users";

@Table({timestamps:true})
export default class Items extends Model<Items> {

    @IsUUID(4)
    @PrimaryKey
    @Column
    id: string;

    @Column
    name: string;

    @Column
    description: string;

    @Column
    previewUrl: string;

    @Column
    fileUrl: string;

    @Column
    cost: number;

    @Column
    category: string;

    @ForeignKey(()=>Users)
    @PrimaryKey
    @Column
    userId: string;
}
