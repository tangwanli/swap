import React, { useState } from 'react'
import { Button, Text, Input, Row } from '@pancakeswap/uikit'

const StepTwo = ({ setGoSteps, defaultAccount, ownerValue, onSubmit }) => {
  const [owner, setOwner] = useState(ownerValue)

  const datas = [
    {
      title: 'Owner',
      placeHolder: 'The owner of the staking contract',
      type: 'text',
      function: (e) => setOwner(e.target.value),
      value: owner,
    },
  ]

  return (
    <>
      <style jsx global>
        {`
          .step-two-item {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .step-two-item .content {
            display: flex;
            justify-content: center;
          }
          .step-two-item .footer {
            display: flex;
            justify-content: flex-end;
            margin-top: auto;
          }
          .text-label {
            margin-bottom: 5px;
          }
          .content-box {
            width: 100%;
          }
        `}
      </style>
      <section className="step-two-item">
        <Row className="row content">
          {datas.map((data, index) => {
            return (
              <div key={data.title} className="content-box">
                <div className="form-group mb-3">
                  <Text bold style={{ marginBottom: '8px' }}>
                    {data.title}
                  </Text>
                  <Input
                    placeholder={data.placeHolder}
                    defaultValue={data.value}
                    autoComplete="off"
                    onChange={data.function}
                  />
                  {index === 0 && (
                    <Button
                      mt="20px"
                      id="Wallet"
                      type="button"
                      variant="success"
                      onClick={() => setOwner(defaultAccount)}
                    >
                      Use Linking Wallet
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </Row>
        <div className="footer">
          <Button
            mr="8px"
            type="button"
            variant="light"
            onClick={() => {
              setGoSteps(0)
              onSubmit(owner)
            }}
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={() => {
              setGoSteps(2)
              onSubmit(owner)
            }}
          >
            Next
          </Button>
        </div>
      </section>
    </>
  )
}

export default StepTwo
