use [LAB-2]

create table Users(
	ID int primary key identity,
	FullName varchar(50) not null,
	Email varchar(50) unique not null,
	Password varchar(60) not null,
	Role varchar(10) default 'User',
	Address varchar(100),
)

select * from users