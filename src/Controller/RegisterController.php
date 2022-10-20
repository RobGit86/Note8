<?php

namespace App\Controller;

use App\Form\RegisterForm;
use App\Entity\User;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class RegisterController extends AbstractController
{
    #[Route('/zarejestruj', name: 'app_register')]
    public function index(UserPasswordHasherInterface $passwordHasher, ManagerRegistry $doctrine, Request $request): Response
    {

        $user = new User();

        $form = $this->createForm(RegisterForm::class, $user);

        $form->handleRequest($request);

        if($form->isSubmitted() && $form->isValid()) {

            $em = $doctrine->getManager();

            $user = $form->getData();

            $plainPassword = $user->getPassword();

            $hashedPassword = $passwordHasher->hashPassword(
                $user,
                $plainPassword
            );

            $user->setPassword($hashedPassword);

            $em->persist($user);
            $em->flush();

            return $this->redirectToRoute('app_register_success');
        }

        return $this->renderForm('register/index.html.twig', [
            'form' => $form,
            'controller_name' => 'RegisterController',
        ]);
    }
}
