use [LAB-2]

create table Users(
	ID int primary key identity,
	FullName varchar(50) not null,
	Email varchar(50) unique not null,
	Password varchar(60) not null,
	Role varchar(10) default 'User',
	Address varchar(100),
)

CREATE TABLE RefreshTokens (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    token NVARCHAR(255) NOT NULL UNIQUE,
    createdAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);
