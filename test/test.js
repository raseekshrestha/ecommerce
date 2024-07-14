import { expect } from "chai";
import mongoose from "mongoose";
import request from 'supertest';
import app from '../src/app.js'

describe('Registration and Login', () => {
    before(async () => {
        await mongoose.connection.dropDatabase();
    });
    it("should register if the user is new", (done) => {
        const payload = { username: "raseek", email: "raseeksht@gmail.com", password: "123", userType: "user" }
        request(app)
            .post("/api/users/register")
            .send(payload)
            .end((err, res) => {
                expect(res.body.message).to.equal("User created")
                expect(res.body).to.have.property("data")
                done()
            })
    })

    it("should fail to register if the user is already present", (done) => {
        const payload = { username: "raseek", email: "raseeksht@gmail.com", password: "123", userType: "user" }
        request(app)
            .post("/api/users/register")
            .send(payload)
            .end((err, res) => {
                expect(res.body.message).to.equal("User already registered")
                done()
            })
    })

    describe("/api/users/login", () => {
        it("should login if credential are correct", (done) => {
            const payload = { usernameOrEmail: "raseek", password: "123" }

            request(app)
                .post("/api/users/login")
                .send(payload)
                .end((err, res) => {
                    expect(res.body.message).to.equal("login success")
                    done()
                })
        })

        it("should return failed respose if credential are incorrect", (done) => {
            const payload = { usernameOrEmail: "raseeksht123@gmail.com", password: "123" }

            request(app)
                .post("/api/users/login")
                .send(payload)
                .end((err, res) => {
                    expect(res.body.message).to.equal("email or password error")
                    done()
                })
        })

    })
});