import Button from "components/common/Button";
import InputEmail from "components/common/Inputs/InputEmail";
import InputPasswordAndCheck from "components/common/Inputs/InputPasswordAndCheck";
import InputUserName from "components/common/Inputs/InputUserName";
import PortalModal from "components/PortalModal";
import { ModalHeader, ModalBody, ModalButton } from "components/common/styles";
import React, { useState } from "react";
import { useCallback } from "react";
import { Link } from "react-router-dom";
import { serverAxios } from "utils/commonAxios";
import { ButtonDiv, RegisterForm, RegisterInformation, RegisterTitle, ToLogin, ToLoginParagraph } from "./style";

function Register() {
  const [showOnFailModal, setShowOnFailModal] = useState(false);
  const [showOnSuccessModal, setShowOnSuccessModal] = useState(false);
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    async function register() {
      // form 핸들
      const form = e.currentTarget;
      const formElements = form.elements;

      try {
        const body = {
          username: formElements?.username.value,
          email: formElements?.email.value,
          password: formElements?.password.value,
        };

        serverAxios.post("/users", body).then(function (response) {
          // POST 요청 성공 시
          // this.props.history.push("/");
          console.log("회원가입 성공");
          setShowOnSuccessModal(true);
        }).catch(() => {
          // POST 요청 실패 시
          console.log(e);
          setShowOnFailModal(true);
        });
      } catch (e) {
      }
    }
    register();
  }, []);

  return (
    <>
      <RegisterTitle>계정 생성하기</RegisterTitle>
      <RegisterInformation>
        회원으로 플레이해서 다른 사용자들과 누가 더 빠른지 겨뤄보세요! <br></br>
        나의 기록도 저장할 수 있답니다!
      </RegisterInformation>
      <RegisterForm onSubmit={handleSubmit}>
        <InputEmail></InputEmail>
        <InputPasswordAndCheck></InputPasswordAndCheck>
        <InputUserName></InputUserName>
        <Button type="submit">시작하기!</Button>
      </RegisterForm>
      <ButtonDiv>
        <ToLoginParagraph>
          계정이 이미 있으세요?{" "}
          <ToLogin>
            <Link to="/login">로그인</Link>
          </ToLogin>
          하러 가기
        </ToLoginParagraph>
      </ButtonDiv>
      <PortalModal open={showOnSuccessModal} onClose={() => { setShowOnSuccessModal(false) }}>
        <ModalHeader>회원가입 성공!</ModalHeader>
        <Link to={"/login"} style={{ width: '100%' }}>
          <ModalButton onClick={() => { setShowOnSuccessModal(false) }}>확인</ModalButton>
        </Link>
      </PortalModal>
      <PortalModal open={showOnFailModal} onClose={() => { setShowOnFailModal(false) }}>
        <ModalHeader>회원가입 실패</ModalHeader>
        <ModalBody>이메일 및 비밀번호를 확인하세요</ModalBody>
        <ModalButton onClick={() => { setShowOnFailModal(false) }}>확인</ModalButton>
      </PortalModal>
    </>
  );
}

export default Register;
